export const validateUserForm = (
  password: string,
  repeatPassword: string
): { error: string; validated: boolean } => {
  let error = "";

  if (password !== repeatPassword) {
    error = "Password and Repeat password should be the same";
  } else if (password.length < 8) {
    error = "Password should be at least 8 characters long";
  } else if (!/\d/.test(password)) {
    // check for digits in password
    error = "Password should contain at least one number";
  } else if (!/[a-z]/.test(password)) {
    // check for lowercase in password
    error = "Password should contain at least one lowercase letter";
  } else if (!/[A-Z]/.test(password)) {
    // check for uppercase in password
    error = "Password should contain at least one uppercase letter";
  } else {
    error = "";
  }

  if (error.length) {
    return {
      error,
      validated: false,
    };
  } else {
    return {
      error,
      validated: true,
    };
  }
};
