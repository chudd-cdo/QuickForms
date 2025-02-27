import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([{ id: "1", title: "Question Title", type: "short", options: [] }]);

  return (
    <FormContext.Provider value={{ formTitle, setFormTitle, formDescription, setFormDescription, questions, setQuestions }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
