import { createContext, useState } from "react";

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [forms, setForms] = useState([]);

  const addForm = (form) => {
    setForms((prevForms) => [...prevForms, form]);
  };

  return (
    <FormContext.Provider value={{ forms, addForm }}>
      {children}
    </FormContext.Provider>
  );
};
