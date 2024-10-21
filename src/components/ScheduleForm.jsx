import { format } from "date-fns";
import React, { useState } from "react";
import { setTimeOnDate, useAddEvent, userTimeZone } from "../hooks/useEvents";
import { useNavigate } from "react-router-dom";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

const formFields = [
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

export default function ScheduleForm({ date, selectedTime, onSubmitForm }) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const mutation = useAddEvent();
  const navigate = useNavigate();
  /*
        COMPLETE SECURTIY/VERIFICATIONS OF FORMDATA
  */

  // const formattedDate = format(date, "EEEE LLL do");
  const formattedDate = format(date, "M/d/yyyy");

  const handleChange = (e, field) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (field.autoCapitalize) {
      updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setState({ ...state, [name]: String(updatedValue) });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateFormData(state);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Prevent submission if there are validation errors
    }

    const { firstName, lastName, email, phoneNumber } = state,
      { startDate, endDate } = setTimeOnDate(date, selectedTime),
      [start, end] = selectedTime.split(" - "),
      summary = `CONSULT [${start}-${end}]: ${firstName} ${lastName} - ${formatPhoneNumber(
        phoneNumber
      )} - ${email}`;

    try {
      onSubmitForm();
      mutation.mutate({ startDate, endDate, summary, timeZone: userTimeZone });
    } catch (err) {
      console.log(err);
    }
  };

  const formProps = {
    errors,
    handleChange,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    state,
  };

  return (
    <form className="container">
      <div className="row">
        <h2>Schedule Consultation</h2>
        <h4>
          {formattedDate} {selectedTime}:
        </h4>
      </div>
      <div className="row">
        <div className="container fit-content">
          {formFields.map((field, idx) => (
            <FormInput {...formProps} field={field} key={idx} />
          ))}
        </div>
        <div
          className="w-100 text-center pt-3"
          style={{ display: mutation.isSuccess && "none" }}
        >
          <button
            className="btn btn-warning"
            onClick={handleSubmit}
            disabled={mutation.isLoading || mutation.isSuccess}
          >
            {mutation.isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
        {mutation.isError && (
          <p>
            <b style={{ color: "red" }}>Error: {mutation.error.message}</b>
          </p>
        )}
        {mutation.isSuccess && (
          <div>
            <p className="pt-4">
              <b style={{ color: "green" }}>Form submitted successfully!</b>
            </p>
            <button
              className="btn btn-success"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Home
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

const FormInput = ({
  errors,
  field,
  handleChange,
  isLoading,
  isSuccess,
  state,
}) => (
  <React.Fragment>
    <div className="row pt-2">
      <div className="col text-end formFieldAbout">
        <b>{field.title}:</b>
      </div>
      <div className="col-auto p-0 text-start">
        {isSuccess ? (
          state[field.name]
        ) : (
          <input
            type={field.type}
            name={field.name}
            onChange={(e) => handleChange(e, field)}
            value={state[field.name]}
            autoCapitalize={field.autoCapitalize ? "on" : "off"}
            style={{
              ...(field.autoCapitalize && {
                textTransform: "capitalize",
              }),
              ...(errors[field.name] && {
                border: "1px solid red",
                borderRadius: 2.5,
              }),
            }}
            autoComplete="on"
            disabled={isLoading}
            className="w-100"
          />
        )}
      </div>
    </div>
    {errors[field.name] && (
      <div
        className="w-100 text-center"
        style={{ color: "red", fontSize: "0.8em" }}
      >
        {errors[field.name]}
      </div>
    )}
  </React.Fragment>
);

// Format the number as (123) 456-7890
const formatPhoneNumber = (number) => {
  // Ensure the input is a string and only contains numbers
  const cleaned = ("" + number).replace(/\D/g, "");
  const formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");

  return formatted;
};

const validateFormData = (data) => {
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
