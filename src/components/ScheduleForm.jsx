import { format } from "date-fns";
import React, { useState } from "react";
import { setTimeOnDate, userTimeZone } from "../hooks/useEvents";
import { useMutation, useQueryClient } from "react-query";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

// Format the number as (123) 456-7890
const formatPhoneNumber = (number) => {
  // Ensure the input is a string and only contains numbers
  const cleaned = ("" + number).replace(/\D/g, "");
  const formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");

  return formatted;
};

const validateFormData = (data) => {
  const { firstName, lastName, email, phoneNumber } = data;
  const errors = [];
  const errorParams = {};

  if (!firstName || firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters long.";
  }

  if (!lastName || lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters long.";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phoneNumber || phoneNumber.replace(/\D/g, "").length !== 10) {
    errors.phoneNumber = "Phone number must be 10 digits long.";
  }

  return errors;
};

export default function ScheduleForm({ date, selectedTime }) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  /*
        COMPLETE SECURTIY/VERIFICATIONS OF FORMDATA
  */

  const formattedDate = format(date, "EEEE LLL do");

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

  const handleChange = (e, field) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (field.autoCapitalize) {
      updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setState({ ...state, [name]: updatedValue });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;
  const mutation = useMutation(
    async (eventData) => {
      const response = await fetch(`${apiUrl}/events/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit event.");
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setSuccess(true);
        console.log("Form successfully submitted: ", data);
      },
      onError: (error) => {
        console.error("Form submission failed:", error.message);
      },
    }
  );

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

    mutation.mutate({ startDate, endDate, summary, timeZone: userTimeZone });
  };

  return (
    <form>
      <h1>Schedule Consultation</h1>
      <h3>
        {formattedDate} from {selectedTime}:
      </h3>
      {formFields.map((field, idx) => (
        <div key={idx}>
          <div className="d-flex w-75 pt-2">
            <div className="flex-grow-1 text-end">
              <b>{field.title}:</b>
            </div>
            <div className="ps-2">
              {success ? (
                state[field.name]
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  onChange={(e) => handleChange(e, field)}
                  value={state[field.name]}
                  autoCapitalize={field.autoCapitalize ? "on" : "off"}
                  style={
                    field.autoCapitalize && { textTransform: "capitalize" }
                  }
                  autoComplete="on"
                />
              )}
            </div>
          </div>
          <div>
            {errors[field.name] && (
              <p style={{ color: "red", fontSize: "0.8em" }}>
                {errors[field.name]}
              </p>
            )}
          </div>
        </div>
      ))}
      <div
        className="w-100 text-center pt-3"
        style={{ display: success && "none" }}
      >
        <button
          className="btn btn-warning"
          onClick={handleSubmit}
          disabled={mutation.isLoading}
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
        <p className="pt-4">
          <b style={{ color: "green" }}>Form submitted successfully!</b>
        </p>
      )}
    </form>
  );
}
