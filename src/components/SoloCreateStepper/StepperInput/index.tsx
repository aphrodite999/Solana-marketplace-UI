import React, { useState } from "react";

import "./styles.css";

export const StepperInput: React.FC<any> = ({
  name,
  type,
  labelComponent,
  isValid,
  error,
  isTextArea = false,
  maxCharacters = 0,
  currentLength,
  ...rest
}) => {
  return (
    <div className="relative w-full">
      <label htmlFor={name} className="stepper-input-label">
        {labelComponent ? labelComponent : name}
      </label>
      {maxCharacters != 0 && (
        <span
          className={`stepper-input-char-limit text-xs text-gray-400
          ${currentLength > maxCharacters && "  text-red-500"}`}
        >
          {currentLength <= maxCharacters ? currentLength : `-${currentLength - maxCharacters}`} /{" "}
          {maxCharacters}
        </span>
      )}
      {isTextArea ? (
        <textarea
          spellCheck={false}
          className={`stepper-input w-full rounded-md focus:outline-none focus:border-blue-500 transition ease-in-out resize-none ${
            !isValid
              ? "border-red-600 focus:border-red-600"
              : "border-gray-500 focus:border-blue-500"
          }`}
          name="description"
          id="description"
          cols={40}
          rows={8}
          {...rest}
        ></textarea>
      ) : (
        <input
          spellCheck={false}
          className={`stepper-input w-full rounded-md focus:outline-none focus:border-blue-500 transition ease-in-out ${
            !isValid
              ? "border-red-600 focus:border-red-600"
              : "border-gray-500 focus:border-blue-500"
          }`}
          type={type}
          id={name}
          name={name}
          {...rest}
        />
      )}
      {!isValid && <span className="absolute top-full left-2 my-1 text-red-600">{error}</span>}
    </div>
  );
};
