import { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTimes } from 'react-icons/fa';

const CreateWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background:rgb(10, 10, 10);
  padding: 2rem;
`;

const CreateCard = styled.div`
  background:rgb(26, 26, 26);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  color: white;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  background:rgb(48, 48, 48);
  color:rgb(192, 192, 192);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;

  &::placeholder {
    color:rgb(128, 128, 128);
  }
`;

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const TitleHeader = styled.h2`
    margin-bottom: 1rem;
`

const OptionInput = styled.input`
  background:rgb(48, 48, 48);
  color:rgb(192, 192, 192);
  padding: 1rem;
  margin-right: 0.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;

  &::placeholder {
    color:rgb(128, 128, 128);
  }
`;

const AddOptionButton = styled.button`
  background:rgb(42, 109, 192);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: rgb(43, 91, 158);
  }
`;

const RemoveOptionButton = styled.button`
  background: none;
  border: none;
  color:rgb(226, 85, 85);
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem;
`;

const SubmitButton = styled.button`
  background: rgb(0, 153, 173);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: rgb(0, 188, 212);
  }
`;

export default function Create() {
    const [question, setQuestion] = useState('');
    // Start with two empty options
    const [options, setOptions] = useState(['', '']);

    const handleAddOption = () => {
        // Get current options, add a new blank one
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        // Remove the option the matches the chosen index
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (e, index) => {
        // Copy options, don't want to modify it without using our useState function
        const newOptions = [...options];
        newOptions[index] = e.target.value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        // Add backend submission later
        console.log('Poll created');
    };

    return (
        <CreateWrapper>
            <CreateCard>
                <TitleHeader>Create Poll</TitleHeader>
                <Input
                    type="text"
                    placeholder="Enter your poll question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                {options.map((option, i) => (
                    <OptionWrapper key={i}>
                        <OptionInput
                            type="text"
                            placeholder={`Option ${i + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(e, i)}
                        />
                        {
                            // There needs to be at least two options.
                            // Only allow users to delete an option if there are more than 2.
                        }
                        {options.length > 2 && (
                            <RemoveOptionButton onClick={() => handleRemoveOption(i)}>
                                <FaTimes />
                            </RemoveOptionButton>
                        )}
                    </OptionWrapper>
                ))}
                <AddOptionButton onClick={handleAddOption}>
                    <FaPlus /> Add Option
                </AddOptionButton>
                <SubmitButton onClick={handleSubmit}>Create Poll</SubmitButton>
            </CreateCard>
        </CreateWrapper>
    );
}
