import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const SkillsSelector = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) => {
  const [customSkill, setCustomSkill] = useState("");

  const predefinedSkills = [
    "UI/UX",
    "Blockchain",
    "Fullstack",
    "AI/LLM",
    "QA",
    "Flutter",
    "HR",
    "Data Science",
    "DevOps",
    "Social Media Marketing",
    "IT Support",
  ];

  const handleSkillToggle = (skill: string) => {
    const currentSkills = new Set(value);
    if (currentSkills.has(skill)) {
      currentSkills.delete(skill);
    } else {
      currentSkills.add(skill);
    }
    onChange(Array.from(currentSkills));
  };

  const handleAddCustomSkill = () => {
    const trimmedSkill = customSkill.trim();
    if (trimmedSkill && !value.includes(trimmedSkill)) {
      onChange([...value, trimmedSkill]);
      setCustomSkill("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full py-6 px-4 ">
          {value.length > 0
            ? `${value.length} skill(s) selected`
            : "Select Skills"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 z-[2000]" align="start">
        <div className="space-y-4">
          <h4 className="font-medium mb-2">Select Skills</h4>

          {/* Predefined Skills */}
          <div className="flex flex-col gap-2 h-80 overflow-y-scroll">
            {predefinedSkills.map((skill) => (
              <div
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`${value.includes(skill) ? "bg-purpleaccent2" : ""} flex items-center space-x-2 p-2 rounded-[8px] justify-between w-full`}
              >
                <label
                  htmlFor={`skill-${skill}`}
                  className="text-sm font-medium"
                >
                  {skill.toUpperCase()}
                </label>
              </div>
            ))}
          </div>

          {/* Custom Skill Input */}
          <div className="flex space-x-2 mt-4">
            <Input
              placeholder="Add custom skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddCustomSkill}
              disabled={!customSkill.trim()}
            >
              ✓
            </Button>
          </div>

          {/* Selected Skills Preview */}
          {value.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Selected Skills:</h5>
              <div className="flex flex-wrap gap-2">
                {value.map((skill) => (
                  <div
                    key={skill}
                    className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};


export default SkillsSelector;
