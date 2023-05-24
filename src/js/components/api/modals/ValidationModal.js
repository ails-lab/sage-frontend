import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import BarLoader from "react-spinners/BarLoader";
import IdleTimer from "react-idle-timer";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ProgressBar from "react-bootstrap/ProgressBar";
import Countdown, { zeroPad } from 'react-countdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { ToastContainer, toast } from 'react-toastify';
import LoadingComponent from '../../LoadingComponent';
import { getValidationProgress } from "../../../utils/PagedAnnotationValidationAPI.js";
import { removeValidationPageLock } from "../../../utils/LocksAPI.js";
import { labelResource } from "../../../utils/APIUtils.js";
import { getDatasetItemPropertiesPropertyValueAndTarget } from "../../../utils/DataAPI.js";
import { filterByLanguage } from "../../../utils/functions.js";
import { Localizer } from "../../../config/localizer.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import isURI from 'validate.io-uri';


const idleTimeout = 1000 * 60 * 10;    // 10 minutes
const toastTimeout = 1000 * 10;        // 10 seconds
const sessionTimeout = 1000 * 60 * 30; // 30 minutes

export class ValidationModal extends Component {
  constructor(props) {
    super(props);
    this.state = this.createState(props);
    this.state.labelsLoaded = false;
    this.state.idleUser = false;
    this.state.idleToastId = null;
    this.state.expirationTime = Date.now() + sessionTimeout;
    this.state.lockReleased = false;
    this.state.totalValidations = 0;
    this.state.totalAnnotations = -1;
    this.state.modalTitle = '';
    this.resolveLabels();

    this.idleTimer = null;
    this.handleOnAction = this.handleOnAction.bind(this);
    this.handleOnActive = this.handleOnActive.bind(this);
    this.handleOnIdle = this.handleOnIdle.bind(this);

    this.handlePageSelection = this.handlePageSelection.bind(this);

    this.prefixMap = new Map();

    for (var i in this.props.rdfVocabularies) {
      this.prefixMap.set(this.props.rdfVocabularies[i].namespace, this.props.rdfVocabularies[i])
    }

  }

  handleOnAction (event) {
    this.setState({idleUser: false});
    if (this.state.idleToastId) {
      toast.dismiss(this.state.idleToastId);
      this.setState({idleToastId: null});
    }
  }

  handleOnActive (event) {
    this.setState({idleUser: false});
  }

  handleOnIdle (event) {
    if (this.state.lockReleased) {
      return;
    }
    this.setState({idleUser: true});

    let id = toast.error(
      "You have been idle for 10 minutes. Become active to keep your changes.",
      {
        autoClose: toastTimeout,
        hideProgressBar: false,
        progress: undefined,
        onClose: () => this.state.idleUser && this.modalCancel()
      }
    );
    this.setState({idleToastId: id});
  }

  handlePageSelection(event) {
    event.preventDefault();
    let page = this.selectedPage;

    if (typeof page.value !== "undefined") {
      if (page.value.length > 0) {
        let num = parseInt(page.value);

        if (page.value > 0 && page.value <= this.props.value.totalPages) {
          this.gotoPage(this.props.value.currentPage, num, null, this.props.value.mode+"_SPECIFIC_PAGE");
        }
        else {
          toast.error("The page you entered does not exist.");
          this.selectedPage.value = '';
        }
      }
    }
  }

  gotoPage(currentPage, requestedPage, navigation, mode) {
    if (this.duplicateAnnotations) {
      toast.error("There are duplicate annotations. Please fix them.");
      return;
    }

    let changes = this.prepareCommit();
    let obj = {
      id: this.props.value.id,
      pageid: this.props.value.pagedAnnotationValidationPageId,
      currentPage: currentPage,
      lockId: this.props.value.lockId,
      edits: changes
    };

    if (requestedPage) {
      obj.requestedPage = requestedPage;
      obj.serial = false;
    }
    else {
      obj.navigation = navigation;
      obj.serial = true;
    }

    if (mode) {
      obj.mode = mode;
    }
    else if (this.props.value.filter && this.props.value.filter !== "ANNOTATED_ONLY_SERIAL" && currentPage !== requestedPage) {
      obj.mode = this.props.value.filter;
    }
    else {
      obj.mode = navigation ? this.props.value.mode + '_SERIAL' : this.props.value.mode + '_SPECIFIC_PAGE';
    }

    this.props.actions('commit-annotation-validation-page', obj);
  }

  modalCancel() {
    if (!this.props.value.pagedAnnotationValidationId || this.state.lockReleased) {
      this.props.onClose();
      return;
    }
    removeValidationPageLock(this.props.value.pagedAnnotationValidationId, this.props.value.mode, this.props.value.currentPage)
      .then(() => {
        this.setState({lockReleased: true});
        toast.dismiss();
        this.props.onClose();
      })
      .catch(error => {
        console.error(error);
        toast.error("Releasing the validation-page lock failed.");
        this.props.onClose();
      });
  }

  modalClose() {
    let changes = this.prepareCommit();
    if (changes.length > 0) {
      if (window.confirm('If you close the modal, all unsaved changes will be discarded')) {
        this.modalCancel();
      }
    }
    else {
      this.modalCancel();
    }
  }

  get duplicateAnnotations() {
    let elements = document.getElementsByClassName("is-invalid");
    if (elements.length === 0) {
      return false;
    }
    return true;
  }

  get filterTitle() {
    if (this.props.value.filter) {
      if (this.props.value.filter === "ANNOTATED_ONLY_SERIAL") {
        return 'All';
      }
      else if (this.props.value.filter === "ANNOTATED_ONLY_NOT_VALIDATED") {
        return 'Not Validated';
      }
      else if (this.props.value.filter === "ANNOTATED_ONLY_NOT_COMPLETE") {
        return 'Partially Validated';
      }
    }
    return 'All';
  }

  resolveLabels() {

    var labelPromises = [];
    var _this = this;

    var newElements = this.state.elements.slice();

    // Map promiseMap = new Map()
    var infoMap = new Map()

    for (const i in _this.state.elements) {
      for (const j in _this.state.elements[i].details) {
        // const current = _this.state[i].details[j];
        const current = _this.state.elements[i].details[j];

        if (!infoMap.has(current.value)) {
          labelPromises.push(
            new Promise(function(resolve, reject) {
              labelResource(current.value)
                .then(json =>  {
                  // newElements[i].details[j] = { ...newElements[i].details[j], label:json};

                  for (var obj of infoMap.get(current.value)) {
                    newElements[obj.i].details[obj.j] = { ...newElements[obj.i].details[obj.j], label:json};
                  }

                  resolve();
                }).catch(() => resolve())
            })
          )
          infoMap.set(current.value, [ {i:i, j:j} ] )
        } else {
          infoMap.get(current.value).push( {i:i, j:j } )
        }

        if (current.value2 !== null && current.value2 !== undefined) {
          if (!infoMap.has(current.value)) {
            labelPromises.push(
              new Promise(function(resolve, reject) {
                labelResource(current.value2)
                  .then((json) =>  {
                    // newElements[i].details[j] = { ...newElements[i].details[j], label:json};
                    for (var obj of infoMap.get(current.value)) {
                      newElements[obj.i].details[obj.j] = { ...newElements[obj.i].details[obj.j], label:json};
                    }

                    resolve();
                  }).catch(() => resolve())
              })
            )

            infoMap.set(current.value, [ {i:i, j:j} ] )
          } else {
            infoMap.get(current.value).push( {i:i, j:j } )
          }
        }
      }
    }

    if (labelPromises.length > 0) {
      Promise.all(labelPromises).then(() => {
        if (newElements.length > 0 || this.props.value.errorMessage) {
          this.setState({ labelsLoaded: true });
        }
        else {
          this.setState({ labelsLoaded: false });
        }
        this.setState({elements: newElements});
      });
    } else {
      this.setState({ labelsLoaded: true });
    }
  }




  hightlightArray(el, input, array) {
    var str = '';
    if (input.lexicalForm) {
      str = input.lexicalForm
    } else if (input.iri) {
      str = input.iri
    }
    var result = ""
    if (!array || array.length === 0) {
      result = str
    } else {
      var index = 0;

      var iarray = [];
      while (index < array.length) {
         if (array[index].start === undefined || array[index].end === undefined || array[index].start < 0 || array[index].end < 0)  {
           index++;
           continue;
         }

         var element = array[index];

         iarray.push({ loc: element.start, type: 'start', element: index, value:element.value} )
         iarray.push({ loc: element.end, type: 'end', element: index, value:element.value} )

         index++;
      }

      var consumed = 0;

      iarray.sort(this.sortIarray);

      for (var i in iarray) {

        var element = iarray[i];

        if (consumed < element.loc) {
          result += str.substr(consumed, element.loc - consumed)
          consumed = element.loc
        }

        if (element.type === 'start') {
          result += '<span title="' + element.value + '" id="element'+ el + '-' + element.element + '" class="highlight">'
        } else if (element.type === 'end') {
          result += '</span>';
        }
      }

      if (str.length > consumed) {
        result += str.substr(consumed);
      }
   }

    return "<code ><pre class='mb-0'>" +  result + (input.language ? '<div><span title="Literal language" class="litlanguage">' + input.language  + '</span></div>': "") + "</pre></code>";
 }


 sortIarray(a,b) {
   if (a.loc < b.loc) {
     return -1;
   } else if (a.loc > b.loc) {
     return 1;
   } else if (a.type === 'start' && a.type === 'end') {
     return 1;
   } else if (a.type === 'start' && a.type === 'start') {
     if (a.element < b.element) {
       return 1;
     } else if (a.element > b.element) {
       return -1;
     } else {
       return 0;
     }
   } else if (a.type === 'end' && a.type === 'end') {
     if (a.element > b.element) {
       return 1;
     } else if (a.element < b.element) {
       return -1;
     } else {
       return 0;
     }
   }
 }

 sortByLocation(a, b) {
   if (a.start && b.start) {
     if (a.start < b.start) {
       return -1;
     } else if (a.start > b.start) {
       return 1;
     } else {
        if (a.end < b.end) {
          return -1
        } else if (a.end > b.end) {
          return 1;
        }
     }
   }

  return 0;
 }

 arraysEqual(a, b) {
   if (a === b) return true;
   if (a == null || b == null) return false;
   if (a.length !== b.length) return false;

   for (var i = 0; i < a.length; ++i) {
     if (a[i] !== b[i]) return false;
   }
   return true;
 }

  createState(props) {
      var state = {};

      // var keys = [];

      var elements = [];

      for (const i in props.value.data) {
        var details = [];
        var cdata = props.value.data[i];

        for (const j in cdata.details) {
          var cdetails = cdata.details[j];

          var el = {...cdetails}

          if (el.state === 'ADD') {
            el = {...el, originalValue: el.value, originalValue2: el.value2}
          }
          if (el.state) {
            el = {...el, originalState: el.state}
          }

          var covered = false;
          if (cdetails.references) {
            for (const r in cdetails.references) {
              if (cdetails.references[r].count == cdata.count) {
                covered = true;
                break;
              }
            }
          }

          el = {...el, fullyReferenced: covered}

          if (el.defaultTargets && el.defaultTargets.length === 1) {
            // el = {...el, defaultTarget: el.defaultTargets[0]}
            // el = {...el, defaultTargetPrefix: el.defaultTarget.substr(0, Math.max(el.defaultTarget.lastIndexOf('/'), el.defaultTarget.lastIndexOf('#')) + 1)}

            var str = el.defaultTargets[0]
            var pos = Math.max(str.lastIndexOf('/'), str.lastIndexOf('#'))

            el.defaultTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]
          }
          delete el['defaultTargets']

          if (el.selectedTarget) {
            // el = {...el, selectedTargetPrefix: el.selectedTarget.substr(0, Math.max(el.selectedTarget.lastIndexOf('/'), el.selectedTarget.lastIndexOf('#')) + 1)}
            //
            // el = {...el, originalTarget: el.selectedTarget}
            // el = {...el, originalTargetPrefix: el.selectedTargetPrefix}

            var str = el.selectedTarget
            var pos = Math.max(str.lastIndexOf('/'), str.lastIndexOf('#'))

            el.selectedTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]
            el.originalTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]

          } else if (el.othersTarget) {
            // el = {...el, selectedTargetPrefix: el.selectedTarget.substr(0, Math.max(el.selectedTarget.lastIndexOf('/'), el.selectedTarget.lastIndexOf('#')) + 1)}
            //
            // el = {...el, originalTarget: el.selectedTarget}
            // el = {...el, originalTargetPrefix: el.selectedTargetPrefix}

            var str = el.othersTarget
            var pos = Math.max(str.lastIndexOf('/'), str.lastIndexOf('#'))

            el.selectedTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]
            el.originalTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]

          } else if (el.defaultTarget) {

            // el = {...el, selectedTarget: el.defaultTarget }
            // el = {...el, selectedTargetPrefix: el.defaultTarget.substr(0, Math.max(el.defaultTarget.lastIndexOf('/'), el.defaultTarget.lastIndexOf('#')) + 1)}
            //
            // el = {...el, originalTarget: el.selectedTarget}
            // el = {...el, originalTargetPrefix: el.selectedTargetPrefix}

            el.selectedTarget = el.defaultTarget.slice()
            el.originalTarget = el.defaultTarget.slice();
          }

          details.push(el);
        }

        details.sort(this.sortByLocation);

        // compute children information
        var uris = new Map()

        for (const j in details) {
          var el = details[j]
          var firstIndex = uris.get(el.value)

          el.visible = true

          if (firstIndex) {

            var firstAnn = details[firstIndex];
            if (!firstAnn.children) {
              firstAnn.children = [ j ] ;
            } else {
              firstAnn.children = firstAnn.children.concat(j) ;
            }

            if (this.equivalentAnnotations(firstAnn, el)) {
              if (!firstAnn.sameChildren) {
                firstAnn.sameChildren = [ j ] ;
              } else {
                firstAnn.sameChildren = firstAnn.sameChildren.concat(j) ;
              }
            } else {
              firstAnn.sameChildren = [] ;
            }

            el.childOf = firstIndex

            details.splice(firstIndex, 1, firstAnn);

          } else {
            uris.set(el.value, j )
          }
        }

        for (const j in details) {
          var el = details[j]

          if (el.children && el.children && el.children.length === el.sameChildren.length) {
            el.visible = true
            el.collapsed = true;
          } else if (el.childOf && details[el.childOf].collapsed) {
            el.visible = false;
          }
        }

        // state['element' + i] = { value: props.value[i].onValue, details,  deleted: [], accepted: [] };

        elements.push({ value: props.value.data[i].onValue, count: props.value.data[i].count, details,  deleted: [], accepted: [] })

      }

      // state.keys = keys;
      state.elements = elements;

      return state;
  }

  annotationStyle(state) {
    if (state === "ACCEPT") {
      return "td-accepted";
    } else if (state === "REJECT") {
      return "td-deleted";
    } else {
      return "td-normal";
    }
  }

  newAnnotation(event, elindex) {
    // var obj = this.state['element' + index];

    var str = this.props.value.onProperty[this.props.value.onProperty.length - 1];
    var pos = Math.max(str.lastIndexOf('/'), str.lastIndexOf('#'))

    var obj = this.state.elements[elindex];
    var add = {value:'', state:'ADD', othersAccepted: 0, othersRejected: 0, visible: true, invalid:true, manual:true}
    add.selectedTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]
    add.originalTarget = [str.substr(0, pos + 1), str.substr(pos + 1)]

    obj = { ...obj, details : obj.details.concat(add) }
    // this.setState({ ['element' + index]: obj });
     this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});
  }

  editAnnotation(event, elindex, annindex) {
    let element = document.getElementById("el-"+elindex+"_ann-"+annindex);
    const feedback = document.getElementById("elv-"+elindex+"_ann-"+annindex);

    var isValid = false
    let foundDuplicate = false;

    if (isURI(event.target.value)) {
      isValid = true;
    }

    element.classList.remove("is-invalid");

    if (isValid) {
      for (const i in this.state.elements[elindex].details) {
        if (i !== annindex.toString() && this.state.elements[elindex].details[i].value === event.target.value)  {
          foundDuplicate = true;
          feedback.textContent = "The annotation already exists"
          element.classList.add("is-invalid");
          break
        }
      }

      if (!foundDuplicate) {
        element.classList.remove("is-invalid");
      }

    } else {
      feedback.textContent = "Invalid IRI"
      element.classList.add("is-invalid");
    }

    var obj = this.state.elements[elindex];
    obj = { ...obj, details : obj.details.map((el,i) => {
      if (i !== annindex) {
        return el
      } else {
        var el2 = { ...el, value: event.target.value}
        delete el2['label']
        delete el2['references']
        if (!isValid || foundDuplicate) {
          el2 = { ...el2, invalid:true}
        } else {
          delete el2['invalid']
        }
        return el2
      }
    })
    }

    if (isValid && !foundDuplicate) {
      var v = event.target.value // !important

      var _this = this;

      this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))},
         () => {
           var promises = [];

           var references;
           var label;
           promises.push(
             new Promise(function(resolve, reject) {
             getDatasetItemPropertiesPropertyValueAndTarget(_this.props.dataset, _this.props.onPropertyPath, obj.value, v)
                 .then((json) => {
                   references = json
                   resolve()
                  }).catch(() => resolve())
                })
           )

           promises.push(
             new Promise(function(resolve, reject) {
              labelResource(v, elindex, annindex)
                     .then((json) => {
                       label = json
                       resolve()
                      }).catch(() => resolve())
                    })
           )

           Promise.all(promises).then(() => {
             var obj = _this.state.elements[elindex]
             obj = { ...obj, details : obj.details.map((el,i) =>  {
               if (i !== annindex)  {
                return  el
              } else  {
                if (references.length > 0 )  {
                  el = { ...el, references: references }
                }

                if (label.length > 0 )  {
                  el = { ...el, label: label }
                }

                return el;
              }
            })
          }
           _this.setState({ elements: _this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))}, )
         })
       })

    } else {
      this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))})
    }
  }


  deleteAnnotation(elindex, annindex) {
    var obj = this.state.elements[elindex]
    var ann = obj.details[annindex];

    //error order is not passed as an argument

    if (ann.state === 'ADD') {
      // obj = { ...obj, details : obj.details.filter((el,i) => i !== order ), deleted: obj.deleted.concat(obj.details[order])}
        obj = { ...obj, details : obj.details.filter((el,i) => i !== annindex ), deleted: obj.deleted.concat(obj.details.filter((el,i) => el.id && el.value === ann.value ))}
    } else {
      obj = { ...obj, details : obj.details.map((el,i) => {
         if (ann.collapsed) {
           return el.value !== ann.value ? el : el.state === 'REJECT' ? {...el, state: 'UNREJECT'} : {...el, state: 'REJECT'}
         } else {
           return i !== annindex ? el : el.state === 'REJECT' ? {...el, state: 'UNREJECT'} : {...el, state: 'REJECT'}
         } } )
       }
    }

    if (ann.children) {
      this.checkForSameChildren(obj, annindex);
    } else if (ann.childOf) {
      this.updateParent(obj, annindex);
    }

    this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});
  }

  acceptAnnotation(elindex, annindex) {
    var obj = this.state.elements[elindex];
    var ann = obj.details[annindex];

    if (ann.state === 'ADD') {
      obj = { ...obj, details : obj.details.filter((el,i) =>  el.value !== ann.value ), accepted: obj.accepted.concat(obj.details.filter((el,i) => el.value === ann.value ))}
    } else {

      obj = { ...obj, details : obj.details.map((el,i) => {
        if (ann.collapsed) {
          return  el.value !== ann.value ? el : el.state === 'ACCEPT' ? {...el, state: 'UNACCEPT'} : {...el, state: 'ACCEPT'}
        } else {
          return  i !== annindex ? el : el.state === 'ACCEPT' ? {...el, state: 'UNACCEPT'} : {...el, state: 'ACCEPT'}
        } } )
      }

      if (ann.children) {
        this.checkForSameChildren(obj, annindex);
      } else if (ann.childOf) {
        this.updateParent(obj, annindex);
      }

    }

    this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});
  }

  updateParent(obj, annindex) {
    var ann = obj.details[annindex]; // needed to get update value

    var pindex = ann.childOf
    var parent = obj.details[pindex]

    if (this.equivalentAnnotations(parent, ann)) {
      var added = false
      var newChildren = parent.sameChildren.slice()

      for (var k in parent.sameChildren) {

        if (parseInt(parent.sameChildren[k]) === annindex) {
          added = true
          break;
        } else if (parseInt(parent.sameChildren[k])> annindex) {
          added = true
          newChildren = newChildren.slice(0, k).concat(annindex.toString()).concat(newChildren.slice(k))
          break;
        }
      }

      if (!added) {
        newChildren = newChildren.concat(annindex.toString())
      }

      parent.sameChildren = newChildren

    } else {
      parent.sameChildren = parent.sameChildren.filter(el => parseInt(el) !== annindex);
    }

  }

  equivalentAnnotations(a1, a2) {
    return (a1.state === a2.state ||
            (a1.state == null && (a2.state === 'UNACCEPT' || a2.state === 'UNREJECT')) ||
            (a2.state == null && (a1.state === 'UNACCEPT' || a1.state === 'UNREJECT')) ||
            ((a1.state === 'UNACCEPT' || a1.state === 'UNREJECT') && (a2.state === 'UNACCEPT' || a2.state === 'UNREJECT'))) &&
    a1.othersAccepted === a2.othersAccepted && a1.othersRejected === a2.othersRejected && this.arraysEqual(a1.defaultTarget, a2.defaultTarget) && this.arraysEqual(a1.selectedTarget, a2.selectedTarget)
  }

  checkForSameChildren(obj, annindex) {
    var ann = obj.details[annindex]; // needed to get update value

    var sameChildren = [];

    for (var k in ann.children) {
      var child = obj.details[ann.children[k]]

      if (this.equivalentAnnotations(child, ann)) {
        sameChildren = sameChildren.concat(ann.children[k]);
      }
    }

    ann.sameChildren = sameChildren;
  }

  prepareCommit() {
    // console.log("PREPARE COMMIT")
    // console.log(this.state.elements)
    var changes = [];
    // for (const i in this.state.keys) {
    for (const i in this.state.elements) {
      let entry = {};
      // var obj = this.state['element' + i];
      var obj = this.state.elements[i];

      let edits = [];
      for (const j in obj.details) {
        if (obj.details[j].state === 'ADD') {
          if (obj.details[j].originalState === 'ADD' && obj.details[j].value !== obj.details[j].originalValue) {
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'ADD', start: -1, end: -1, count: obj.details[j].count, target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null, references: obj.details[j].references } ) // change annotationEdit value
          } else if (!obj.details[j].originalState && obj.details[j].value.length > 0) {
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'ADD', start: -1, end: -1, count: obj.count, target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null, references: obj.details[j].references } ) // add annotationEdit

          } else if (obj.details[j].originalState === 'ADD' && !this.arraysEqual(obj.details[j].selectedTarget, obj.details[j].originalTarget)) {
            edits.push( {id: obj.details[j].id, editType:'CHANGE_TARGET', target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null })
          }
        } else if (obj.details[j].state === 'UNREJECT') {
          if (obj.details[j].originalState === 'ACCEPT' || obj.details[j].originalState === 'REJECT') {
            edits.push( {id: obj.details[j].id, count: obj.details[j].count}) //delete annotationEdit
          }
        } else if (obj.details[j].state === 'UNACCEPT') {
          if (obj.details[j].originalState === 'ACCEPT' || obj.details[j].originalState === 'REJECT') {
            edits.push( {id: obj.details[j].id, count: obj.details[j].count}) //delete annotationEdit
          }
        } else if (obj.details[j].state === 'REJECT') {
          if (obj.details[j].originalState === 'ACCEPT') {
            edits.push( {id: obj.details[j].id, count: obj.details[j].count})
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'REJECT', start: obj.details[j].start, end: obj.details[j].end, count: obj.details[j].count})
          } else if (!obj.details[j].originalState) {
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'REJECT', start: obj.details[j].start, end: obj.details[j].end, count: obj.details[j].count})
          }
        } else if (obj.details[j].state === 'ACCEPT') {
          if (obj.details[j].originalState === 'REJECT') {
            edits.push( {id: obj.details[j].id, count: obj.details[j].count})
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'ACCEPT', start: obj.details[j].start, end: obj.details[j].end, count: obj.details[j].count, target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null })
          } else if (!obj.details[j].originalState) {
            edits.push( {id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'ACCEPT', start: obj.details[j].start, end: obj.details[j].end, count: obj.details[j].count, target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null })

          } else if (obj.details[j].originalState === 'ACCEPT' && !this.arraysEqual(obj.details[j].selectedTarget, obj.details[j].originalTarget)) {
            edits.push( {id: obj.details[j].id, editType:'CHANGE_TARGET', target: obj.details[j].selectedTarget ? this.buildTarget(obj.details[j].selectedTarget) : null })
          }
        }
      }

      for (const j in obj.deleted) {
        edits.push( {id: obj.deleted[j].id, count: obj.deleted[j].count})      //delete added annotationEdit
      }

      if (edits.length > 0) {
        entry.propertyValue = obj.value;
        entry.edits = edits;
        changes.push(entry);
      }
    }

    return changes;
  }

  componentWillReceiveProps(props) {
    if (this.props.value.errorMessage !== props.value.errorMessage) {
      if (props.value.errorMessage === "redirect") {
        if (props.value.filter === "ANNOTATED_ONLY_SPECIFIC_PAGE" || props.value.filter === "UNANNOTATED_ONLY_SPECIFIC_PAGE") {
          toast.error("The requested page is not free");
        }
        else {
          toast.error("No free pages in this direction");
        }
      }
      else if (props.value.errorMessage === "NO_PAGE_FOUND") {
        toast.error("There are no pages with the selected criteria");
      }
    }

    if (this.selectedPage) {
      this.selectedPage.value = '';
    }

    var update = false;
    if (this.props.value.currentPage !== props.value.currentPage || this.props.value.mode !== props.value.mode) {
      update = true;
    }
    if ( this.props.state === null ||
         (this.props.state !== null &&
           (this.props.state.loaded !== props.state.loaded || this.props.state.loading !== props.state.loading || this.props.state.failed !== props.state.failed) ) ) {
      update = true
    }
    if (update) {
      this.setState( this.createState(props), ()=> this.resolveLabels() );

      let propLst = props.onProperty.split("/");
      let propName = propLst[propLst.length - 1];
      this.setState({ expirationTime: Date.now()+sessionTimeout, modalTitle: `${props.datasetName} (${propName.charAt(0).toUpperCase() + propName.slice(1)})` });

      if (props.value.pagedAnnotationValidationId) {
        getValidationProgress(props.value.pagedAnnotationValidationId)
        .then(response => {
          this.setState({totalValidations: response.totalValidations, totalAnnotations: response.totalAnnotations, totalAdded: response.totalAdded});
        })
        .catch(error => {
          console.error(error);
        });
      }
    }
}


  componentWillUnmount() {
    toast.dismiss();
    // Fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state,callback)=>{
      return;
    };

  }


  selectedTargetPrefixChanged(elindex, annindex, event) {
    var obj = this.state.elements[elindex];
    var ann = obj.details[annindex];

    obj = { ...obj, details: obj.details.map((el, i) => {
         if (ann.collapsed) {
           if (el.value !== ann.value) {
             return el;
           } else {
             if (document.getElementById("el-p-"+elindex+"_ann-"+i)) {
               document.getElementById("el-p-"+elindex+"_ann-"+i).value = event.target.value;
               document.getElementById("el-t-"+elindex+"_ann-"+i).value = '';
             }
             // delete el['selectedTarget']
             // return {...el, selectedTargetPrefix: event.target.value  }
             return {...el, selectedTarget: [ event.target.value ] }
           }
         } else {
           if (i !== annindex) {
             return el;
           } else {
             if (document.getElementById("el-p-"+elindex+"_ann-"+i)) {
               document.getElementById("el-p-"+elindex+"_ann-"+i).value = event.target.value;
               document.getElementById("el-t-"+elindex+"_ann-"+i).value = '';
             }
             // delete el['selectedTarget']
             // return {...el, selectedTargetPrefix: event.target.value  }
             return {...el, selectedTarget: [ event.target.value ] }
           } }

         }
       )
     }

     if (ann.children) {
       this.checkForSameChildren(obj, annindex);
     } else if (ann.childOf) {
       this.updateParent(obj, annindex);
     }

    // this.setState({  ['element' + index]: obj  }, )
    this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});
  }


  selectedTargetChanged(elindex, annindex, event) {

    var obj = this.state.elements[elindex];
    var ann = obj.details[annindex];

    obj = { ...obj, details: obj.details.map((el, i) => {
         if (ann.collapsed) {
           if (el.value !== ann.value) {
             return el;
           } else {
             if (document.getElementById("el-t-"+elindex+"_ann-"+i)) {
               document.getElementById("el-t-"+elindex+"_ann-"+i).value = event.target.value;
             }
             // return el.value !== ann.value ?  el : {...el, selectedTarget: event.target.value }
             return el.value !== ann.value ?  el : {...el, selectedTarget: [ el.selectedTarget[0], event.target.value.substr(el.selectedTarget[0].length ) ] }
           }
         } else {
           if (i !== annindex) {
             return el;
           } else {
             if (document.getElementById("el-t-"+elindex+"_ann-"+i)) {
               document.getElementById("el-t-"+elindex+"_ann-"+i).value = event.target.value;
             }
             // return el.value !== ann.value ?  el : {...el, selectedTarget: event.target.value  }
             return el.value !== ann.value ?  el : {...el, selectedTarget: [el.selectedTarget[0], event.target.value.substr(el.selectedTarget[0].length ) ] }
           } }

         }
       )
     }

     if (ann.children) {
       this.checkForSameChildren(obj, annindex);
     } else if (ann.childOf) {
       this.updateParent(obj, annindex);
     }

    this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});
}

highlightItem(elindex, annindex) {
  if (document.getElementById('element'+elindex + '-' + annindex)) {
    document.getElementById('element'+elindex + '-' + annindex).classList.add('highlight-selected')
  }


  var ann = this.state.elements[elindex].details[annindex];
  if (ann.collapsed) {
    for (var k in ann.children) {
      document.getElementById('element'+elindex + '-' + ann.children[k]).classList.add('highlight-selected')
    }
  }
}

dehighlightItem(elindex, annindex) {
  if (document.getElementById('element'+elindex + '-' + annindex)) {
    document.getElementById('element'+elindex + '-' + annindex).classList.remove('highlight-selected')
  }

  var ann = this.state.elements[elindex].details[annindex];
  if (ann.collapsed) {
    for (var k in ann.children) {
      document.getElementById('element'+elindex + '-' + ann.children[k]).classList.remove('highlight-selected')
    }
  }
}

expandAnnotation(elindex, annindex) {
  var obj = this.state.elements[elindex]

  obj = { ...obj, details: obj.details.map((el,i) => {
       return i === annindex ? { ...el, collapsed: false } : (parseInt(el.childOf) === annindex ? {...el, visible: true} : el ) } )
  }

  // this.setState({  ['element' + index]: obj  })
  this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});

  var ann = this.state.elements[elindex].details[annindex];
    for (var k in ann.children) {
      document.getElementById('element'+elindex + '-' + ann.children[k]).classList.remove('highlight-selected')
    }

}

collapseAnnotation(elindex, annindex) {
  //collapsing should not be availble if different children !
  var obj = this.state.elements[elindex]

  obj = { ...obj, details: obj.details.map((el,i) => {
       return i === annindex ? { ...el, collapsed: true } : (parseInt(el.childOf) === annindex ? {...el, visible: false} : el ) } )
  }

  // this.setState({  ['element' + index]: obj  })
  this.setState({ elements: this.state.elements.slice(0, elindex).concat(obj).concat(this.state.elements.slice(elindex + 1))});

}

buildTarget(target) {
  return target[0] + target[1]
}

  render() {
 // console.log(this.state.elements);
// console.log(this.prefixMap);

    return (
      <div>
      <IdleTimer
        ref={ref => { this.idleTimer = ref }}
        timeout={idleTimeout}
        onActive={this.handleOnActive}
        onIdle={this.handleOnIdle}
        onAction={this.handleOnAction}
        debounce={250}
      />
      {/* <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        rtl={false}
        closeOnClick={false}
        pauseOnHover={false}
        draggable
      /> */}
      <Modal
        size="xl"
        show={this.props.show}
        onHide={() => this.modalClose()}
        animation={false}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Validations: <span className="font-size-4 font-weight-normal">{this.state.modalTitle}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="validation-modal pb-0 px-0">
          {this.props.state.loading &&
            <Col className="loader m-4 d-flex justify-content-center">
              <BarLoader
                css='spinner'
                height={6}
                width={200}
                color='crimson'
                loading={true}/>
            </Col>
          }
          {!this.state.labelsLoaded &&
            <div className="blur-layer">
              <LoadingComponent text="Fetching annotation data" />
            </div>
          }
          {!this.props.state.loading &&
            <React.Fragment>
            <Row className="bottomrow modalFilters">
              {/*
                <React.Fragment>
                  <Col md="auto pr-1">
                    <Button type="button" className="nextbutton" aria-label="Previous" onClick={() => this.gotoPage(true, this.props.pageHistory[0], this.props.value.mode, false, '', null, '')}>
                      <span className="fa fa-chevron-left"></span>
                    </Button>
                  </Col>
                  <Col md="auto pl-1 backButtonLabel">
                    Previous
                  </Col>
                </React.Fragment>
              */}
              <Col className="align-self-center ml-4">
                <strong>Remaining time: </strong>
                <Countdown
                  date={this.state.expirationTime}
                  renderer={({ hours, minutes, seconds, completed }) => <span className="ml-1">{zeroPad(minutes)}:{zeroPad(seconds)}</span>}
                  onComplete={() => this.modalCancel()}
                />
              </Col>
              {this.state.totalAnnotations > 0 &&
                <Col className="position-absolute align-self-center text-center">
                  <strong className="mr-1">Validations:</strong><span className="mr-3">{this.state.totalValidations}</span>
                  <strong className="mr-1">Annotations:</strong><span className="mr-3">{this.state.totalAnnotations}</span>
                  <strong className="mr-1">Additions:</strong><span>{this.state.totalAdded}</span><br/>
                  <strong className="mr-1">Progress:</strong><span>{this.state.totalAnnotations > 0 ? (100 * this.state.totalValidations / this.state.totalAnnotations).toFixed(2) : 0}%</span>
                </Col>
              }
              <Col md="auto">
                <ButtonGroup className="annotationFilters pr-3">
                  {this.props.value.mode==='ANNOTATED_ONLY' &&
                    <DropdownButton
                      id="extra-filters"
                      title={this.filterTitle}
                      variant="light"
                      className="mr-1"
                    >
                      <OverlayTrigger key="overlay-all" placement="left" delay={50} overlay={<Tooltip id="tooltip-all">Navigate through all annotated pages</Tooltip>}>
                        <Dropdown.Item as="button" className="py-2" key="filter-none" active={!this.props.value.filter || this.props.value.filter==='ANNOTATED_ONLY_SERIAL'} onClick={() => this.gotoPage(0, null, "RIGHT", "ANNOTATED_ONLY_SERIAL")}>
                          <span>All</span>
                        </Dropdown.Item>
                      </OverlayTrigger>
                      <OverlayTrigger key="overlay-not-validated" placement="left" delay={50} overlay={<Tooltip id="tooltip-not-validated">Navigate through pages with zero validations</Tooltip>}>
                        <Dropdown.Item as="button" className="py-2" key="filter-not-validated" active={this.props.value.filter==='ANNOTATED_ONLY_NOT_VALIDATED'} onClick={() => this.gotoPage(0, null, "RIGHT", "ANNOTATED_ONLY_NOT_VALIDATED")}>
                          <span>Not Validated</span>
                        </Dropdown.Item>
                      </OverlayTrigger>
                      <OverlayTrigger key="overlay-not-completed" placement="left" delay={50} overlay={<Tooltip id="tooltip-not-completed">Navigate through pages that contain validations, but not for all annotations</Tooltip>}>
                        <Dropdown.Item as="button" className="py-2" key="filter-not-completed" active={this.props.value.filter==='ANNOTATED_ONLY_NOT_COMPLETE'} onClick={() => this.gotoPage(0, null, "RIGHT", "ANNOTATED_ONLY_NOT_COMPLETE")}>
                          <span>Partially Validated</span>
                        </Dropdown.Item>
                      </OverlayTrigger>
                    </DropdownButton>
                  }
                  <Button variant={this.props.value.mode==='ANNOTATED_ONLY' ? "primary" : "secondary"} onClick={() => this.gotoPage(0, null, "RIGHT", "ANNOTATED_ONLY_SERIAL")}>Annotated</Button>
                  <Button variant={this.props.value.mode==='UNANNOTATED_ONLY' ? "primary" : "secondary"} onClick={() => this.gotoPage(0, null, "RIGHT", "UNANNOTATED_ONLY_SERIAL")}>Non Annotated</Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row>
              <ProgressBar
                className="progress-line w-100 mx-1"
                now={this.state.totalAnnotations > 0 ? (100 * this.state.totalValidations / this.state.totalAnnotations).toFixed(2) : 0}
              />
            </Row>
            </React.Fragment>
          }
          {this.props.state.failed &&
            <div className="text-center py-5">
              <span className="error">Loading values failed.</span>
            </div>
          }
          {this.props.value.errorMessage === "NO_PAGE_FOUND" &&
          <div className="text-center py-5">
            <span className="error">We couldn't find a page with the selected criteria.<br/>Please select a new mode.</span>
          </div>
          }
          {this.props.value.errorMessage !== "NO_PAGE_FOUND" && this.props.state.loaded &&
            <div className="scrollContainer">
              <div className="scroll">
                {this.state.elements.map((el,elindex) =>
                  <Row className="grouping bottomrow"  key={elindex}>
                    <Col md="auto align-items-center pt-2">
                      <span className="sticky-value">{(this.props.value.currentPage-1)*20 + elindex + 1}</span>
                    </Col>
                    <Col className="property-value align-items-center pr-1">
                      <div className="sticky-value" dangerouslySetInnerHTML={{__html: this.hightlightArray(elindex, el.value, el.details)}}></div>
                    </Col>
                    <Col md="auto align-items-center pt-2">
                      <Container className="annotation-uris sticky-value">
                        <Row><span title="Items count" className="annotation-uris-count">{el.count}</span></Row>
                        <Row><Button type="button" className="menubutton annotation-uris-browse"  aria-label="Browse" onClick={() => this.props.actions('get-items-by-property-value', {onPropertyPath : this.props.onPropertyPath, value: el.value })}><FontAwesomeIcon title="Browse items" className="fa" icon={faGlobe}/></Button></Row>
                      </Container>
                    </Col>


                    <Col className="pl-1 pr-2">
                      <Container>
                      {el.details.map((ann,annindex) =>
                        !ann.visible ?
                        <div/> :
                        <Row key={annindex} className={"td-row align-items-center align-self-center"
                                            + (ann.fullyReferenced ? " disabled-annotation" :
                                              (ann.othersRejected > ann.othersAccepted ? " reject-bias" : (ann.othersAccepted > ann.othersRejected ? " accept-bias" : " non-validated-annotation")))
                                            + (!ann.fullyReferenced && ann.manual ? " manual-annotation" : "")
                                            }
                          onMouseOver={()=>  this.highlightItem(elindex, annindex)}
                          onMouseOut={()=>  this.dehighlightItem(elindex, annindex)}>
                          {/*{ann.collapsed &&
                            <Row className="group-annotation-button-container">
                              <Button title={"Ungroup " + ann.value + " annotations"} type="button" className="expandbutton" onClick={(event) => this.expandAnnotation(elindex, annindex)}>
                                <FontAwesomeIcon className="fa" icon={faLock}/>
                              </Button>
                            </Row>}
                          {!ann.collapsed && ann.children && ann.children.length === ann.sameChildren.length &&
                            <Row className="group-annotation-button-container">
                              <Button title={"Group " + ann.value + " annotations"} type="button" className="expandbutton" onClick={(event) => this.collapseAnnotation(elindex, annindex)}>
                                <FontAwesomeIcon className="fa" icon={faLockOpen}/>
                              </Button>
                            </Row>
                          } */}

                        {ann.fullyReferenced &&
                          <Col md={1} className="annotation-actions-column"/>}

                        {!ann.fullyReferenced && ann.state !== 'ADD' &&
                          <Col md={1} className="annotation-actions-column">
                            <Button type="button" disabled={!this.props.edit} className={ann.state==='REJECT' ? "deleteeditbutton selected" : "deleteeditbutton"} aria-label="Delete" onClick={(event) => this.deleteAnnotation(elindex, annindex)}>
                              <span title={ann.state==='REJECT' ? "Unreject annotation" : "Reject annotation"} className={ann.state==='REJECT' ? "fa fa-times-circle" : "fa fa-times"}></span>
                            </Button>
                            <Button type="button" disabled={!this.props.edit} className={ann.state==='ACCEPT' ? "approveButton selected" : "approveButton"} aria-label="Approve" onClick={(event) => this.acceptAnnotation(elindex, annindex)}>
                              <span title={ann.state==='ACCEPT' ? "Unaccept annotation" : "Accept annotation"} className={ann.state==='ACCEPT' ? "fa fa-check-circle" : "fa fa-check"}></span>
                            </Button>
                          </Col>}

                        {!ann.fullyReferenced && ann.state === 'ADD' &&
                          <React.Fragment>
                            {(ann.state === 'ADD' && ann.othersAccepted === 0 && ann.othersRejected === 0) ?
                              <Col md={1} className="annotation-actions-column">
                                <Button title="Delete annotation" type="button" disabled={!this.props.edit} className="deleteannotationbutton" aria-label="Delete" onClick={(event) => this.deleteAnnotation(elindex, annindex)}>
                                  <span className="fa fa-trash-o"></span>
                                </Button>
                              </Col>
                              :
                              <Col md={1} className="annotation-actions-column"></Col>
                            }
                          </React.Fragment>
                        }

                        <Col>
                        {ann.state !== 'ADD' || ann.othersAccepted > 0 || ann.othersRejected > 0 ?
                          <Row>
                          {ann.value2 ?
                            <React.Fragment>
                              <Col md={10} className="text-truncate px-0">
                                <Row>
                                  <a href={ann.value} rel='noreferrer noopener' target="_blank">
                                    <span className={ann.state === "REJECT" ? "td-deleted" : "td-normal"}>{ann.value}</span>
                                  </a> -
                                </Row>
                                <Row>
                                  <a href={ann.value2} rel='noreferrer noopener' target="_blank">
                                    <span className={ann.state === "REJECT" ? "td-deleted" : "td-normal"}>{ann.value2}</span>
                                  </a>
                                </Row>
                              </Col>
                              <Col md={2} className="px-0 text-right">
                                {ann.score !== null && ann.score !== undefined &&
                                  <span title="Annotation score" className="td-label score">{ann.score.toFixed(3)}</span>
                                }
                              </Col>
                            </React.Fragment>
                          :
                            <React.Fragment>

                              <Col md={ann.collapsed || !ann.collapsed && (ann.children && ann.children.length === ann.sameChildren.length) ? 10 : 11} className="text-truncate px-0">
                                <a href={ann.value} rel='noreferrer noopener' target="_blank">
                                  <span className={this.annotationStyle(ann.state)}>{ann.value}</span>
                                </a>
                              </Col>

                              {ann.collapsed &&
                                <Col md={1} className="group-annotation-button-container-inline">
                                  <Button title={"Ungroup " + ann.value + " annotations"} type="button" className="expandbutton" onClick={(event) => this.expandAnnotation(elindex, annindex)}>
                                    <FontAwesomeIcon className="fa" icon={faLock}/>
                                  </Button>
                                </Col>}
                              {!ann.collapsed && (ann.children && ann.children.length === ann.sameChildren.length) &&
                                <Col md={1} className="group-annotation-button-container-inline">
                                  <Button title={"Group " + ann.value + " annotations"} type="button" className="expandbutton" onClick={(event) => this.collapseAnnotation(elindex, annindex)}>
                                    <FontAwesomeIcon className="fa" icon={faLockOpen}/>
                                  </Button>
                                </Col>
                              }
                              <Col md={1} className="px-0 text-right">
                                {ann.score !== null && ann.score !== undefined &&
                                  <span title="Annotation score" className="td-label score">{ann.score.toFixed(3)}</span>
                                }
                              </Col>
                            </React.Fragment>
                          }
                          </Row>
                        :
                          <Row>
                            <Col className="px-0">
                              <Form.Control
                                id={"el-"+elindex+"_ann-"+annindex} className="add-annotation"
                                defaultValue={ann.value}
                                onChange={event => this.editAnnotation(event, elindex, annindex)}/>
                              <Form.Control.Feedback type="invalid" id={"elv-"+elindex+"_ann-"+annindex} className="add-annotation-feedback">
                                {/*The annotation already exists.*/}
                              </Form.Control.Feedback>
                            </Col>
                            <Col md="auto align-self-center px-3">
                              <a title="Visit uri" href={ann.value} rel='noreferrer noopener' target="_blank"><span className="fa fa-link"/></a>
                            </Col>
                          </Row>
                        }

                        {(ann.label && ann.label[0]) &&
                          <Row className="annotation-info">
                             <span title="Annotation label" className="td-label annotation-label">{filterByLanguage(ann.label[0],'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
                             {(ann.label2 && ann.label2[0]) &&
                             <span title="Annotation label" className="td-label annotation-label"> - {filterByLanguage(ann.label2[0],'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>}
                          </Row>
                        }

                        {ann.label && ann.label[0] && filterByLanguage(ann.label[0],'http://purl.org/dc/terms/description', this.props.language) &&
                          <Row>
                            <span title="Annotation description" className="td-label description">{filterByLanguage(ann.label[0],'http://purl.org/dc/terms/description', this.props.language)}</span>
                          </Row>
                        }

                        {!ann.fullyReferenced && (ann.state === 'ACCEPT' || ann.state === 'ADD' || (!this.props.edit && ann.othersAccepted > ann.othersRejected)) && !ann.hasOwnProperty('invalid') &&
                          <Form.Group className={(ann.fullyReferenced ? " disabled-element" : "")}>
                            <Row className="ann-scope-row">
                              <Col md={3} className="ann-scopetitle-col"><span title="Select a target item property for the annotation" className="export-as-label">export as</span></Col>
                              <Col md={4} className="ann-scope-col">
                                <Form.Control as="select" id={"el-p-"+elindex+"_ann-"+annindex} disabled={!this.props.edit}
                                className={ann.selectedTarget && ann.defaultTarget && ann.selectedTarget[0] === ann.defaultTarget[0] ? "ann-scope-form-default" : "ann-scope-form"}
                                defaultValue={ann.selectedTarget && ann.selectedTarget[0] ? this.prefixMap.get(ann.selectedTarget[0]).namespace : ''}
                                onChange={(event) => this.selectedTargetPrefixChanged(elindex, annindex, event)}>
                                   <option className="ann-scope-option" value=''> -- Prefix -- </option>
                                   {this.props.rdfVocabularies.map((el2, index) =>
                                      <option key={index} className={ann.defaultTarget && el2.namespace === ann.defaultTarget[0] ? "ann-scope-option-default" : "ann-scope-option"} value={el2.namespace}>{el2.prefix}</option>
                                   )}
                                </Form.Control>
                              </Col>
                                <React.Fragment>
                                  <Col className="ann-scope-col">
                                    <Form.Control as="select" id={"el-t-"+elindex+"_ann-"+annindex} disabled={!this.props.edit}
                                     className={ann.selectedTarget && ann.defaultTarget && this.buildTarget(ann.selectedTarget) === this.buildTarget(ann.defaultTarget) ? "ann-scope-form-default" : "ann-scope-form"}
                                     defaultValue={ann.selectedTarget ? this.buildTarget(ann.selectedTarget) : ''}
                                     onChange={(event) => this.selectedTargetChanged(elindex, annindex, event)}>>
                                    <option className="ann-scope-option" value=''> -- Property -- </option>
                                    {ann.selectedTarget && this.prefixMap.get(ann.selectedTarget[0]).properties.map((el2, index) =>
                                       <option key={index} className={ann.defaultTarget && el2 === this.buildTarget(ann.defaultTarget) ? "ann-scope-option-default" : "ann-scope-option"} value={el2}>{el2.substr(this.prefixMap.get(ann.selectedTarget[0]).namespace.length)}</option>
                                    )}
                                    </Form.Control>
                                  </Col>
                                </React.Fragment>
                            </Row>
                          </Form.Group>
                        }

                        {ann.references &&
                        <DropdownButton size="sm"  title={<span title="Actions" className='fa fa-info'></span>} className="actions">
                          <div className="reference-block-in">
                            <span className="font-8 pr-2">{ann.value} appears in the original item metadata as the value of the following properties:</span>
                          {ann.references.map((ref,rindex) =>
                            <Row className="ref-scope-row-in">
                            {/*<Col md={3} className="ref-scopetitle-col"><span title="Select a target item property for the annotation" className="export-as-label">{rindex == 0 ? "appears as" : ""}</span></Col>*/}
                            <Col className="ref-scope-col-in">
                             <ProgressBar className="reference">
                                 <ProgressBar title={"It appears as " + ref.iri  + " in " + ref.count + " of the " + el.count + " items."} className="ref-label" now={(ref.count / el.count*1.0)*100} label ={ref.iri}/>
                             </ProgressBar>
                             </Col>
                             </Row>
                          )}
                          </div>
                        </DropdownButton>}

                        {/*ann.references &&
                        <DropdownButton size="sm"  title={<span title="Actions" className='fa fa-info'></span>} className="actions">
                          <div title="Item properties with same value as annotation" className="reference-block-in">
                          {ann.references.map((ref,rindex) =>
                            <Row className="ref-scope-row-in">
                            <Col md={3} className="ref-scopetitle-col"><span title="Select a target item property for the annotation" className="export-as-label">{rindex == 0 ? "appears as" : ""}</span></Col>
                            <Col className="ref-scope-col-in">
                             <ProgressBar className="reference">
                                 <ProgressBar title={ann.value + " appears in " + Math.round((ref.count / el.count*1.0)*100) + "% of the items as a value of the " + ref.iri + " property"} className="ref-label" variant="success" now={(ref.count / el.count*1.0)*100} label ={ref.iri}/>
                             </ProgressBar>
                             </Col>
                             </Row>
                          )}
                          </div>
                        </DropdownButton>*/}

                        </Col>
                        </Row>
                      )}
                      </Container>
                    </Col>
                    <Col md="auto align-self-end ml-0 pl-0 pr-3">
                      <Button title="Add new annotation" type="button" disabled={!this.props.edit} className="deleteaddbutton" aria-label="New" onClick={(event) => this.newAnnotation(event,elindex)}><span className="fa fa-plus annotation-add"></span></Button>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          }
        </Modal.Body>

        {this.props.value.errorMessage !== "NO_PAGE_FOUND" && this.state.labelsLoaded &&
        <Modal.Footer>
          <Row className="modalFooter">
            {this.props.state.loading &&
            <Col md="10" className="modalPagination ml-1"/>}

            {!this.props.state.loading &&
            <Col md="10" className="modalPagination ml-1">
              <OverlayTrigger key="overlay-previous" placement="left" defaultShow={false} delay={100} overlay={<Tooltip id="tooltip-previous">Previous available page</Tooltip>}>
                <Button
                  type="button"
                  disabled={this.props.value.currentPage <= 1 || this.props.state.loading}
                  variant={this.props.value.currentPage <= 1 ? "outline-light" : "light"}
                  aria-label="Previous"
                  className="nextbutton"
                  onClick={() => this.gotoPage(this.props.value.currentPage, null, "LEFT", null)}>
                    <span className="fa fa-angle-double-left"></span>
                </Button>
              </OverlayTrigger>
              <div className="align-self-center mx-2">
                Page
              </div>
              <Form id="page-selector" onSubmit={this.handlePageSelection}>
                <Form.Row>
                  <Col>
                    <Form.Control
                      placeholder={this.props.value.currentPage}
                      as="input"
                      maxLength={3}
                      className="pageSelector"
                      ref={node => (this.selectedPage = node)}
                    />
                  </Col>
                </Form.Row>
              </Form>
              <div className="align-self-center mx-2">
                of <strong>{this.props.value.totalPages}</strong>
              </div>
              <OverlayTrigger key="overlay-next" placement="right" defaultShow={false} delay={100} overlay={<Tooltip id="tooltip-next">Next available page</Tooltip>}>
                <Button
                  type="button"
                  disabled={this.props.value.currentPage === this.props.value.totalPages || this.props.state.loading}
                  variant={this.props.value.currentPage === this.props.value.totalPages ? "outline-light" : "light"}
                  aria-label="Next"
                  className="nextbutton"
                  onClick={() => this.gotoPage(this.props.value.currentPage, null, "RIGHT", null)}
                >
                  <span className="fa fa-angle-double-right"></span>
                </Button>
              </OverlayTrigger>
            </Col>}
            <Col md="auto">
              <Button
                disabled={!!this.duplicateAnnotations || !this.props.edit || this.props.state.loading}
                variant="primary"
                onClick={() => this.gotoPage(this.props.value.currentPage, this.props.value.currentPage, null, null)}>
                Save
              </Button>
            </Col>
            <Col md="auto">
              <Button variant="secondary" onClick={() => this.modalCancel()}>
                Cancel
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
        }
      </Modal>
      </div>
  )}
}

export default ValidationModal;
