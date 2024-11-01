import React, { useId, useState } from "react";
import { format } from "date-fns";
import { setTimeOnDate, useAddEvent, userTimeZone } from "../hooks/useEvents";
import { useLocation, useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import {
  formFields,
  initialState,
  formatPhoneNumber,
  validateFormData,
} from "../utils/scheduleForm";

export default function ScheduleForm({
  date,
  selectedTime,
  onSubmitForm,
  setSelectedDate,
}) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const mutation = useAddEvent();
  const location = useLocation();
  const navigate = useNavigate();
  const eventId = useId();

  /*
        COMPLETE SECURTIY/VERIFICATIONS OF FORMDATA
  */

  const formattedDate = format(date, "M/d/yyyy");

  const handleChange = (event, field) => {
    const { name, value } = event.target;
    let updatedValue = value;

    if (field.autoCapitalize) {
      updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setState({ ...state, [name]: String(updatedValue) });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateFormData(state);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Prevent submission if there are validation errors
    }

    const { firstName, lastName, email, phoneNumber } = state;
    const { startDate, endDate } = setTimeOnDate(date, selectedTime);
    const [start, end] = selectedTime.split(" - ");
    const summary = `CONSULT [${start}-${end}]: ${firstName} ${lastName} - ${formatPhoneNumber(
      phoneNumber
    )} - ${email}`;

    try {
      onSubmitForm();
      mutation.mutate({
        startDate,
        endDate,
        summary,
        timeZone: userTimeZone,
        id: eventId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleHomeButton = (event) => {
    event.preventDefault();
    setSelectedDate
      ? setSelectedDate(null)
      : navigate(location.state?.prevPath || "/");
  };

  return (
    <form className="container show-times-container">
      <div className="row show-times-title p-2">
        <span style={{ fontSize: "1rem", fontWeight: "500" }}>
          Schedule Consultation
        </span>
        <span style={{ fontSize: "1rem" }}>
          {formattedDate} @{" "}
          <span className="text-primary">
            <b>{selectedTime}</b>
          </span>
        </span>
      </div>
      <div className="row schedule-form">
        <div
          className={`container${!mutation.isSuccess ? " fit-content" : ""}`}
        >
          {formFields.map((field, idx) => (
            <FormInput
              errors={errors}
              field={field}
              handleChange={handleChange}
              mutation={mutation}
              state={state}
              key={idx}
            />
          ))}
        </div>
        <div
          className="w-100 text-center pt-3"
          style={{ display: mutation.isSuccess && "none" }}
        >
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || mutation.isSuccess}
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
        {mutation.isError && (
          <p>
            <b style={{ color: "red" }}>Error: {mutation.error.message}</b>
          </p>
        )}
        {((import.meta.env.DEV && (mutation.isSuccess || mutation.isPending)) ||
          mutation.isSuccess) && (
          <div>
            <p className="pt-4">
              <b style={{ color: "green" }}>Form submitted successfully!</b>
            </p>
            <button className="btn btn-success" onClick={handleHomeButton}>
              Home
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
