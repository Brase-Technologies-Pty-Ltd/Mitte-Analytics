import React, { useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';

interface OptionType {
  label: string;
  value: string;
}

interface SelectWithSearchProps {
  options: OptionType[];
  placeholder?: string;
  onSelect: (selectedOption: OptionType | null) => void;
  value?: string;
  isDisabled?: boolean;
  required?: boolean;
  isClearable?: boolean;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({ options, placeholder, value, isDisabled, onSelect, required, isClearable }) => {
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  useEffect(() => {
    if (value) {
      const selected = options.find(option => option.value === value) || null;
      setSelectedOption(selected);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleChange = (newValue: SingleValue<OptionType>) => {
    setSelectedOption(newValue);
    onSelect(newValue);
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={placeholder || 'Select...'}
      isSearchable
      isClearable={isClearable}
      isDisabled={isDisabled}
      required={required}
      isMulti={false}
    />
  );
};

export default SelectWithSearch;
