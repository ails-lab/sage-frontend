<template>
  <ActionSidebar id="offcanvasAddIndex" ref="addIndexCanvas">
    <ActionSidebarHeader
      :title="$t('add_index_sidebar.title')"
      :description="$t('add_index_sidebar.description')"
      :close-label="$t('cancel')"
    >
      <template #action>
        <ActionSidebarHeaderAction href="#" :aria-label="$t('save')">
          {{ $t("save") }}
        </ActionSidebarHeaderAction>
      </template>
    </ActionSidebarHeader>
    <ActionSidebarBody>
      <div class="sage-form">
        <div class="sage-form-template">
          <div class="template-load">
            {{ $t("template.load_template") }}
            <div class="wrap">
              <select class="form-select" aria-label="formTemplate">
                <option selected>{{ $t("please_select") }}</option>
                <option value="Template 1">Template 1</option>
                <option value="Template 2">Template 2</option>
              </select>
              <i class="fa-solid fa-angle-down"></i>
            </div>
          </div>
          <div class="template-save">
            <a href="#">
              <i class="fa-regular fa-floppy-disk"></i>
              {{ $t("template.save_template") }}
            </a>
          </div>
        </div>
        <div class="field row">
          <label class="form-label col" for="indexType">
            <div class="lbl">{{ $t("index") }} *</div>
            <div class="desc">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore.
            </div>
          </label>
          <div class="form-field col">
            <select class="form-select" aria-label="indexType">
              <option selected>{{ $t("please_select") }}</option>
              <option value="Data Mapping">New Index</option>
              <option value="Data Mapping">Option 2</option>
            </select>
            <div class="form-sublabel space">
              {{ $t("add_index_sidebar.new_index_identifier") }}
            </div>
            <input class="form-control" type="text" aria-label="mappingName" />
          </div>
        </div>
        <div class="field row">
          <label class="form-label col" for="indexType">
            <div class="lbl">{{ $t("index_engine") }} *</div>
            <div class="desc">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore.
            </div>
          </label>
          <div class="form-field col">
            <select class="form-select" aria-label="indexType">
              <option selected>{{ $t("please_select") }}</option>
              <option value="Data Mapping">ails-elastic-chameleon</option>
              <option value="Data Mapping">ails-elastic-chameleon 2</option>
            </select>
          </div>
        </div>
        <div class="field row wide selection">
          <label class="form-label col" for="indexType">
            <div class="lbl">{{ $t("selection") }} *</div>
          </label>
          <div class="form-field col">
            <div class="desc">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore.
            </div>
          </div>
        </div>
        <div class="field">
          <div class="selection-expand">
            <div class="root selected">
              <a href="#">
                <i class="plus fa-solid fa-plus"></i>
                <i class="check fa-solid fa-check"></i>
              </a>
              <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
            </div>
            <ul>
              <li>
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
              </li>
              <li class="selected">
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://data.europa.eu/m8g/AdminUnit</span>
                <ul>
                  <li class="selected">
                    <a href="#">
                      <i class="plus fa-solid fa-plus"></i>
                      <i class="check fa-solid fa-check"></i>
                    </a>
                    <span class="txt">http://data.europa.eu/m8g/code</span>
                    <div class="index-field">
                      <table class="table">
                        <thead>
                          <tr>
                            <th>{{ $t("add_index_sidebar.name") }}</th>
                            <th>{{ $t("add_index_sidebar.type") }}</th>
                            <th>{{ $t("add_index_sidebar.datatype") }}</th>
                            <th>{{ $t("add_index_sidebar.languages") }}</th>
                            <th>{{ $t("add_index_sidebar.expansion") }}</th>
                            <th class="action">
                              <a class="add" href="#">
                                <i class="fa-solid fa-plus"></i>
                              </a>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input class="form-control" type="text" />
                            </td>
                            <td>
                              <select class="form-select">
                                <option selected>
                                  {{ $t("please_select") }}
                                </option>
                                <option value="literal">Literal</option>
                              </select>
                            </td>
                            <td>
                              <input class="form-control" type="text" />
                            </td>
                            <td>
                              <input class="form-control" type="text" />
                            </td>
                            <td>
                              <select class="form-select wide">
                                <option selected>
                                  {{ $t("please_select") }}
                                </option>
                                <option value="literal">Literal</option>
                              </select>
                            </td>
                            <td class="action">
                              <a class="delete" href="#">
                                <i class="fa-regular fa-trash-can"></i>
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </li>
                  <li class="selected">
                    <a href="#">
                      <i class="plus fa-solid fa-plus"></i>
                      <i class="check fa-solid fa-check"></i>
                    </a>
                    <span class="txt">http://data.europa.eu/m8g/level</span>
                    <ul>
                      <li class="selected">
                        <a href="#">
                          <i class="plus fa-solid fa-plus"></i>
                          <i class="check fa-solid fa-check"></i>
                        </a>
                        <span class="txt">http://data.europa.eu/m8g/code</span>
                        <div class="index-field">
                          <table class="table">
                            <thead>
                              <tr>
                                <th>{{ $t("add_index_sidebar.name") }}</th>
                                <th>{{ $t("add_index_sidebar.type") }}</th>
                                <th>{{ $t("add_index_sidebar.datatype") }}</th>
                                <th>{{ $t("add_index_sidebar.languages") }}</th>
                                <th>{{ $t("add_index_sidebar.expansion") }}</th>
                                <th class="action">
                                  <a class="add" href="#">
                                    <i class="fa-solid fa-plus"></i>
                                  </a>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select wide">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td class="action">
                                  <a class="delete" href="#">
                                    <i class="fa-regular fa-trash-can"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select wide">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td class="action">
                                  <a class="delete" href="#">
                                    <i class="fa-regular fa-trash-can"></i>
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </li>
                      <li>
                        <a href="#">
                          <i class="plus fa-solid fa-plus"></i>
                          <i class="check fa-solid fa-check"></i>
                        </a>
                        <span class="txt">http://data.europa.eu/m8g/code</span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">
                      <i class="plus fa-solid fa-plus"></i>
                      <i class="check fa-solid fa-check"></i>
                    </a>
                    <span class="txt">http://data.europa.eu/m8g/level</span>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://www.w3.org/ns/locn#Address</span>
              </li>
              <li class="selected">
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://www.w3.org/ns/adms#Identifier</span>
                <ul>
                  <li>
                    <a href="#">
                      <i class="plus fa-solid fa-plus"></i>
                      <i class="check fa-solid fa-check"></i>
                    </a>
                    <span class="txt">http://data.europa.eu/m8g/level</span>
                  </li>
                  <li class="selected">
                    <a href="#">
                      <i class="plus fa-solid fa-plus"></i>
                      <i class="check fa-solid fa-check"></i>
                    </a>
                    <span class="txt">http://data.europa.eu/m8g/level</span>
                    <ul>
                      <li class="selected">
                        <a href="#">
                          <i class="plus fa-solid fa-plus"></i>
                          <i class="check fa-solid fa-check"></i>
                        </a>
                        <span class="txt">http://data.europa.eu/m8g/level</span>
                        <div class="index-field">
                          <table class="table">
                            <thead>
                              <tr>
                                <th>{{ $t("add_index_sidebar.name") }}</th>
                                <th>{{ $t("add_index_sidebar.type") }}</th>
                                <th>{{ $t("add_index_sidebar.datatype") }}</th>
                                <th>{{ $t("add_index_sidebar.languages") }}</th>
                                <th>{{ $t("add_index_sidebar.expansion") }}</th>
                                <th class="action">
                                  <a class="add" href="#">
                                    <i class="fa-solid fa-plus"></i>
                                  </a>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select wide">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td class="action">
                                  <a class="delete" href="#">
                                    <i class="fa-regular fa-trash-can"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <input class="form-control" type="text" />
                                </td>
                                <td>
                                  <select class="form-select wide">
                                    <option selected>
                                      {{ $t("please_select") }}
                                    </option>
                                    <option value="literal">Literal</option>
                                  </select>
                                </td>
                                <td class="action">
                                  <a class="delete" href="#">
                                    <i class="fa-regular fa-trash-can"></i>
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </li>
                      <li class="selected">
                        <a href="#">
                          <i class="plus fa-solid fa-plus"></i>
                          <i class="check fa-solid fa-check"></i>
                        </a>
                        <span class="txt">http://data.europa.eu/m8g/level</span>
                        <ul>
                          <li>
                            <a href="#">
                              <i class="plus fa-solid fa-plus"></i>
                              <i class="check fa-solid fa-check"></i>
                            </a>
                            <span class="txt">
                              http://data.europa.eu/m8g/level
                            </span>
                          </li>
                          <li>
                            <a href="#">
                              <i class="plus fa-solid fa-plus"></i>
                              <i class="check fa-solid fa-check"></i>
                            </a>
                            <span class="txt">
                              http://data.europa.eu/m8g/level
                            </span>
                          </li>
                        </ul>
                      </li>
                      <li class="selected">
                        <a href="#">
                          <i class="plus fa-solid fa-plus"></i>
                          <i class="check fa-solid fa-check"></i>
                        </a>
                        <span class="txt">http://data.europa.eu/m8g/level</span>
                        <ul>
                          <li>
                            <a href="#">
                              <i class="plus fa-solid fa-plus"></i>
                              <i class="check fa-solid fa-check"></i>
                            </a>
                            <span class="txt">
                              http://data.europa.eu/m8g/level
                            </span>
                          </li>
                          <li>
                            <a href="#">
                              <i class="plus fa-solid fa-plus"></i>
                              <i class="check fa-solid fa-check"></i>
                            </a>
                            <span class="txt">
                              http://data.europa.eu/m8g/level
                            </span>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
            <div class="root selected">
              <a href="#">
                <i class="plus fa-solid fa-plus"></i>
                <i class="check fa-solid fa-check"></i>
              </a>
              <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
            </div>
            <ul>
              <li>
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
              </li>
              <li>
                <a href="#">
                  <i class="plus fa-solid fa-plus"></i>
                  <i class="check fa-solid fa-check"></i>
                </a>
                <span class="txt">http://data.europa.eu/m8g/AdminUnit</span>
              </li>
            </ul>
            <div class="root">
              <a href="#">
                <i class="plus fa-solid fa-plus"></i>
                <i class="check fa-solid fa-check"></i>
              </a>
              <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
            </div>
            <div class="root">
              <a href="#">
                <i class="plus fa-solid fa-plus"></i>
                <i class="check fa-solid fa-check"></i>
              </a>
              <span class="txt">http://www.w3.org/ns/legal#LegalEntity</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sage-form-info">
        <div class="notify">{{ $t("mandatory_field_explanation") }}</div>
      </div>
    </ActionSidebarBody>
  </ActionSidebar>
</template>

<script setup lang="ts">
const addIndexCanvas = ref();
</script>

<style lang="scss" scoped>
.index-field .table {
  th {
    background-color: unset;
    color: unset;
  }
}
</style>
