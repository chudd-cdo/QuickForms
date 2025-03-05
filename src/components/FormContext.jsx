import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formId, setFormId] = useState(null); // Track form being edited
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([
    { id: "1", question_text: "Question Title", question_type: "short", options: [] }
  ]);

  return (
    <FormContext.Provider value={{ 
      formId, setFormId, 
      formTitle, setFormTitle, 
      formDescription, setFormDescription, 
      questions, setQuestions 
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
