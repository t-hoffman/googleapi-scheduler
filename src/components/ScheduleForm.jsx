import React, { useId, useState } from "react";
import { setTimeOnDate, useAddEvent, userTimeZone } from "../hooks/useEvents";
import { useLocation, useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import {
  formFields,
  initialState,
  formatPhoneNumber,
  validateFormData,
} from "../utils/scheduleForm";
import { SubmitIcon } from "./Icons";
import { PuffLoader } from "react-spinners";

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
    <form onSubmit={handleSubmit}>
      <div className={`container${!mutation.isSuccess ? " fit-content" : ""}`}>
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
        {!mutation.isSuccess && (
          <SubmitButton isPending={mutation.isPending} onClick={handleSubmit} />
        )}
      </div>
      {mutation.isError && (
        <p className="pt-1">
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
    </form>
  );
}

const SubmitButton = ({ onClick, isPending }) => (
  <div className="d-flex justify-content-end pe-3 schedule-form-submit">
    <button
      disabled={isPending}
      className="d-flex align-items-center text-primary"
      {...(!isPending && { onClick })}
    >
      <b className="pe-1" style={{ fontSize: "1rem" }}>
        {isPending ? "Submitting" : "Submit"}
      </b>{" "}
      {!isPending ? (
        <SubmitIcon width="25px" height="25px" style={{ fill: "#0C6DFD" }} />
      ) : (
        <PuffLoader
          color="#505056"
          cssOverride={{ display: "inline-block" }}
          size={25}
        />
      )}
    </button>
  </div>
);
