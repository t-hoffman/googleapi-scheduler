export const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

export const formFields = [
  {
    title: "First Name",
    name: "firstName",
    type: "text",
    autoCapitalize: true,
  },
  {
    title: "Last Name",
    name: "lastName",
    type: "text",
    autoCapitalize: true,
  },
  { title: "Email", name: "email", type: "email" },
  { title: "Phone Number", name: "phoneNumber", type: "tel" },
];

// Format the number as (123) 456-7890
export const formatPhoneNumber = (number) => {
  // Ensure the input is a string and only contains numbers
  const cleaned = ("" + number).replace(/\D/g, "");
  const formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");

  return formatted;
};

export const validateFormData = (data) => {
  const { firstName, lastName, email, phoneNumber } = data;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const errors = {};

  const errorParams = {
    firstName: [
      {
        check: !firstName || firstName.length < 2,
        message: "First name must be at least 2 characters long.",
      },
      {
        check: firstName && firstName.length > 32,
        message: "First name must be less than 32 characters long.",
      },
    ],
    lastName: [
      {
        check: !lastName || lastName.length < 2,
        message: "Last name must be at least 2 characters long.",
      },
      {
        check: lastName && lastName.length > 32,
        message: "Last name must be less than 32 characters long.",
      },
    ],
    email: [
      {
        check: !email || !emailRegex.test(email),
        message: "Please enter a valid email address.",
      },
    ],
    phoneNumber: [
      {
        check: !phoneNumber || phoneNumber.replace(/\D/g, "").length !== 10,
        message: "Phone number must be 10 digits long.",
      },
    ],
  };

  for (const key in errorParams) {
    errorParams[key].some(({ check, message }) => {
      if (check) {
        errors[key] = message;
        return true; // Exit loop once an error is found
      }
      return false;
    });
  }

  return errors;
};
