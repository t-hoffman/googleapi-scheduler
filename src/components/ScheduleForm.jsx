import { format } from "date-fns";
import React, { useState } from "react";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

const formatPhoneNumber = (number) => {
  // Ensure the input is a string and only contains numbers
  const cleaned = ("" + number).replace(/\D/g, "");

  // Format the number as (123) 456-7890
  const formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");

  return formatted;
};

export default function ScheduleForm({ date, selectedTime }) {
  const [state, setState] = useState(initialState);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { firstName, lastName, email, phoneNumber } = state;
    const [first, second] = selectedTime.split(" - ");
    const title = `CONSULT [${first}-${second}]: ${firstName} ${lastName}, ${formatPhoneNumber(
      phoneNumber
    )} - ${email}`;
    console.log(title);
  };

  return (
    <form>
      <h1>Schedule Consultation</h1>
      <h3>
        {formattedDate} from {selectedTime}:
      </h3>
      {formFields.map((field, idx) => (
        <div className="d-flex w-75 pt-2" key={idx}>
          <div className="flex-grow-1 text-end">
            <b>{field.title}:</b>
          </div>
          <div className="ps-2">
            <input
              type={field.type}
              name={field.name}
              onChange={(e) => handleChange(e, field)}
              value={state[field.name]}
              autoCapitalize={field.autoCapitalize ? "on" : "off"}
              style={field.autoCapitalize && { textTransform: "capitalize" }}
            />
          </div>
        </div>
      ))}
      <div className="w-100 text-center pt-3">
        <button className="btn btn-warning" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </form>
  );
}
