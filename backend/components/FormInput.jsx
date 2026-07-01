function FormInput({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false
}) {
  return (
    <div className="mb-3">

      <input
        className="form-control"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />

    </div>
  );
}

export default FormInput;