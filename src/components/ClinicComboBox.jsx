/* eslint-disable react/prop-types */
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import admin from "../controllers/admin";
import UseClinicsData from "../hooks/UseClinicsData";

export default function ClinicComboBox({
  setState,
  name,
  defaultData,
  isDisabled,
  isDisabledOverright,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { clinicsData } = UseClinicsData();

  const isClinicRole =
    String(admin?.role?.name || "").toLowerCase() === "clinic";
  const isDoctorRole =
    String(admin?.role?.name || "").toLowerCase() === "doctor";

  const allowedClinics = useMemo(() => {
    const allClinics = Array.isArray(clinicsData) ? clinicsData : [];

    if (!isDoctorRole && !isClinicRole && !admin?.clinic_id) {
      return allClinics;
    }

    if (admin?.owner_clinic?.clinic_id || admin?.clinic_id) {
      const ownerClinicId = admin?.owner_clinic?.clinic_id ?? admin?.clinic_id;
      const ownerClinic =
        allClinics.find((clinic) => Number(clinic.id) === Number(ownerClinicId)) || {
          id: Number(ownerClinicId),
          title:
            admin?.owner_clinic?.clinic_title || admin?.clinic_title || "Clinic",
        };

      return ownerClinic ? [ownerClinic] : [];
    }

    if (isDoctorRole) {
      const mappedDoctorClinics = (admin?.doctor_clinics || []).map((item) => {
        const existing = allClinics.find(
          (clinic) => Number(clinic.id) === Number(item.clinic_id)
        );

        return (
          existing || {
            id: Number(item.clinic_id),
            title: item.clinic_title,
            clinic_id: Number(item.clinic_id),
            is_default: item.is_default,
            is_active: item.is_active,
          }
        );
      });

      const uniqueClinics = mappedDoctorClinics.filter(
        (item, index, arr) =>
          arr.findIndex((x) => Number(x.id) === Number(item.id)) === index
      );

      return uniqueClinics.length > 1
        ? [{ id: "all", title: "All" }, ...uniqueClinics]
        : uniqueClinics;
    }

    return allClinics;
  }, [clinicsData, isDoctorRole, isClinicRole]);

  useEffect(() => {
    if (isClinicRole && (admin?.owner_clinic?.clinic_id || admin?.clinic_id)) {
      const ownerClinicId = admin?.owner_clinic?.clinic_id ?? admin?.clinic_id;
      const clinic =
        allowedClinics?.find(
          (item) => Number(item.id) === Number(ownerClinicId)
        ) || {
          id: Number(ownerClinicId),
          title:
            admin?.owner_clinic?.clinic_title || admin?.clinic_title || "Clinic",
        };

      if (clinic) {
        setState(clinic);
        setValue(clinic);
      }
      return;
    }

    if (defaultData !== undefined && defaultData !== null && defaultData !== "") {
      if (typeof defaultData === "string" || typeof defaultData === "number") {
        const clinic = allowedClinics?.find(
          (item) => String(item.id) === String(defaultData)
        );
        if (clinic) {
          setState(clinic);
          setValue(clinic);
          return;
        }
      } else if (typeof defaultData === "object") {
        setState(defaultData);
        setValue(defaultData);
        return;
      }
    }

    if (isDoctorRole && !value && allowedClinics?.length) {
      const allOption = allowedClinics.find((item) => String(item.id) === "all");
      if (allOption) {
        setState(allOption);
        setValue(allOption);
      }
    }
  }, [allowedClinics, defaultData, isClinicRole, isDoctorRole, setState, value]);

  const isDisabledFinal = isDisabledOverright ? false : isDisabled || isClinicRole;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          isDisabled={isDisabledFinal}
          size="md"
          textAlign="left"
          justifyContent="space-between"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-8 justify-between bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] capitalize text-left border border-[#E2E8F0]"
          _disabled={{
            cursor: "not-allowed",
          }}
        >
          {value?.title || `Select ${name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 max-h-[240px] overflow-y-scroll hideScrollbar z-[1500] bg-white">
        <Command className="bg-white">
          <CommandInput
            placeholder={`Search ${name}`}
            className="text-black"
          />
          <CommandEmpty>No {name} found.</CommandEmpty>

          <CommandGroup>
            {allowedClinics?.map((item) => (
              <CommandItem
                key={String(item.id)}
                value={String(item.title)}
                onSelect={() => {
                  if (String(value?.id) === String(item.id)) {
                    setValue("");
                    setState("");
                  } else {
                    setValue(item);
                    setState(item);
                  }
                  setOpen(false);
                }}
                className="capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    String(value?.id) === String(item.id)
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
                {String(item.id) === "all"
                  ? item.title
                  : `#${item.id} ${item.title}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}