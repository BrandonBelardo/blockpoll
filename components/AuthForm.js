import styled from "styled-components";

export default function AuthForm({ title, onSubmit, buttonText, extraFields = [] }) {
    return (
        <CardContainer>
            <CardForm onSubmit={onSubmit}>
                <CardTitle>{title}</CardTitle>
                <FormBlock>
                    <CardLabel>Email:</CardLabel>
                    <CardInput type="email" name="email" required />
                </FormBlock>
                <FormBlock>
                    <CardLabel>Password:</CardLabel>
                    <CardInput type="password" name="password" required />
                </FormBlock>
                {extraFields.map((field, index) => (
                    <FormBlock key={index}>
                        <CardLabel>{field.label}</CardLabel>
                        <CardInput type={field.type} name={field.name} required={field.required} />
                    </FormBlock>
                ))}
                <FormSubmit type="submit" value={buttonText} />
            </CardForm>
        </CardContainer>
    );
}

const CardContainer = styled.div`
    background-color: #201d24;
    margin-top: 10vh;
    width: 25rem;
    max-height: fit-content;
    border-radius: 7px;
    box-shadow: 0px 3px 10px -2px black;
    padding-bottom: 20px;
`;

const CardForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const CardTitle = styled.h2`
    margin: 25px 25px 0px;
`;

const CardLabel = styled.label`
    margin: 35px 25px 5px;
`;

const CardInput = styled.input`
    display: block;
    width: 19rem;
    margin: 10px 25px 0px;
    padding: 16px;
    border-radius: 15px;
    border-color: rgb(67, 111, 182);
    border-width: 3px;
    color: inherit;
    background-color: #17151a;
    font-size: 16px;
`;

const FormBlock = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
`;

const FormSubmit = styled.input`
    display: block;
    background-color: rgb(81, 138, 227);
    padding: 10px 50px;
    margin: 35px 25px 0px;
    font-weight: 550;
    font-size: 15px;
    border-color: rgb(81, 138, 227);
    border-radius: 0.2rem;
    width: 21.5rem;
    color: inherit;
    transition: background-color 0.2s;    
    
    &:hover {
        background-color: rgb(67, 111, 182);
    }
`;