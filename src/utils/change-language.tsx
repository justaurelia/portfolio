import { useTranslation } from "react-i18next";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import english from "../assets/flags/english.svg";
import french from "../assets/flags/french.svg";
import spanish from "../assets/flags/spain.svg";
import portuguese from "../assets/flags/portugal.svg";

const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const onChangeLang = (value: string) => {
    i18n.changeLanguage(value);
  };

  const options = ["en", "fr", "es", "pt"];

  const formatLang = {
    en: english,
    fr: french,
    es: spanish,
    pt: portuguese,
  };

  return (
    <div>
      <Menu>
        <MenuHandler>
          <img
            src={formatLang[i18n.language as keyof typeof formatLang]}
            alt={i18n.language}
            className="w-[24px] cursor-pointer"
          />
        </MenuHandler>
        <MenuList className="border-none z-[1200] shadow-none min-w-px outline-none bg-transparent dark:bg-gray-800">
          {options
            .filter((where) => where !== i18n.language)
            .map((option) => (
              <MenuItem
                key={option}
                className="flex items-center gap-2 hover:scale-125 duration-100"
                onClick={() => onChangeLang(option)}
              >
                <img
                  src={formatLang[option as keyof typeof formatLang]}
                  alt={option}
                  className="w-[24px]"
                />
              </MenuItem>
            ))}
        </MenuList>
      </Menu>
    </div>
  );
};

export default ChangeLanguage;
