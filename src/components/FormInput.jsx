import { Fragment } from "react";

export default function FormInput({
  errors,
  field,
  handleChange,
  mutation,
  state,
}) {
  return (
    <Fragment>
      <div className="row pt-2">
        <div className="col w-50 text-end">
          <b>{field.title}:</b>
        </div>
        <div className="col-auto p-0 w-50 text-start">
          {mutation.isSuccess ? (
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
              disabled={mutation.isPending}
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
    </Fragment>
  );
}
