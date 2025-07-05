"use client";

import { useEffect, useRef, useState } from "react";

interface AutocompleteOption {
  id: number | string;
  label: string;
  value: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChangeAction: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

export function Autocomplete({
  options,
  value,
  onChangeAction,
  placeholder = "Search...",
  className = "",
  required = false,
  id,
  name,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] =
    useState<AutocompleteOption[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    setInputValue(selectedOption ? selectedOption.label : value);
  }, [value, options]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.value.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // If the input matches an option exactly, use its value
    const exactMatch = options.find(
      (option) => option.label.toLowerCase() === newValue.toLowerCase(),
    );
    if (exactMatch) {
      onChangeAction(exactMatch.value);
    } else {
      onChangeAction(newValue);
    }
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChangeAction(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow option click
    setTimeout(() => setIsOpen(false), 200);
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        autoComplete="off"
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto mt-1"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                index === highlightedIndex ? "bg-blue-100" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{option.label}</span>
                {option.label !== option.value && (
                  <span className="text-sm text-gray-500">{option.value}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && inputValue && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 px-3 py-2 text-gray-500">
          No options found
        </div>
      )}
    </div>
  );
}
