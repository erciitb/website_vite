import React, {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';

import {
  ArrowLeft,
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  Send,
  User,
  Car,
  Minus,
  Plus,
  BatteryCharging,
  Box,
  Cog,
  Gauge,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';


/* =========================================================
   CONFIG
========================================================= */

const MECHANICAL_KIT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzFyJAqhhlHhHXkS1eQB9uqExfn7VcRVrF7hqcBDnh7BtlxrruOUFjTo1_MMsMOHz4y/exec';


/* =========================================================
   TYPES
========================================================= */

type AddOnType =
  | ''
  | 'None'
  | 'Servo mounted Ultrasonic'
  | 'IR based line follower';

type ChasisType =
  | ''
  | 'Acrylic'
  | 'Black metal chasis'
  | 'White metal chasis';

type BatteryType =
  | ''
  | 'LiPo'
  | 'Li-ion';


interface FormData {
  vehicleNo: string;

  addOnType: AddOnType;

  ultrasonicSensorHC_SR04: string;
  servoSG90: string;
  noOfIRs: string;

  chasisType: ChasisType;

  wheels7x2: string;
  wheels7x4: string;
  wheels10x4: string;

  noOfMotors: string;
  motorRPM: string;

  controllerBattery: string;
  batteryType: BatteryType;
  batteryCharger: string;

  screwDriver: string;

  paymentSS: string;
  transactionID: string;
}


/* =========================================================
   URL DATA
========================================================= */

const searchParams =
  new URLSearchParams(window.location.search);

const vehicleNoFromURL =
  searchParams.get('vehicleNo') || '';

const teamNameFromURL =
  searchParams.get('teamName') || '';


/* =========================================================
   INITIAL FORM
========================================================= */

const initialFormData: FormData = {
  vehicleNo: vehicleNoFromURL,

  addOnType: '',

  ultrasonicSensorHC_SR04: '0',
  servoSG90: '0',
  noOfIRs: '0',

  chasisType: '',

  wheels7x2: '0',
  wheels7x4: '0',
  wheels10x4: '0',

  noOfMotors: '0',
  motorRPM: '',

  controllerBattery: '1',
  batteryType: '',
  batteryCharger: '0',

  screwDriver: '1',

  paymentSS: '',
  transactionID: '',
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Xlr8Registration() {

  const {
    user,
    isLoggedIn,
  } = useAuth() as {
    user: {
      name?: string;
      roll?: string;
    } | null;
    isLoggedIn: boolean;
  };


  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [submitError, setSubmitError] =
    useState('');


  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitError('');
  };


  /* =======================================================
     QUANTITY
  ======================================================= */

  const updateQuantity = (
    field: keyof FormData,
    amount: number
  ) => {

    setFormData((prev) => {

      const current =
        Number(prev[field]) || 0;

      const next =
        Math.max(
          0,
          current + amount
        );

      return {
        ...prev,
        [field]: String(next),
      };

    });

    setSubmitError('');
  };


  /* =======================================================
     ADD-ON
  ======================================================= */

  const handleAddOnChange = (
    value: AddOnType
  ) => {

    if (
      value ===
      'Servo mounted Ultrasonic'
    ) {

      setFormData((prev) => ({
        ...prev,

        addOnType: value,

        ultrasonicSensorHC_SR04: '1',
        servoSG90: '1',
        noOfIRs: '0',
      }));

    } else if (
      value ===
      'IR based line follower'
    ) {

      setFormData((prev) => ({
        ...prev,

        addOnType: value,

        ultrasonicSensorHC_SR04: '0',
        servoSG90: '0',
        noOfIRs: '2',
      }));

    } else {

      setFormData((prev) => ({
        ...prev,

        addOnType: value,

        ultrasonicSensorHC_SR04: '0',
        servoSG90: '0',
        noOfIRs: '0',
      }));

    }

    setSubmitError('');
  };


  /* =======================================================
     BATTERY TYPE
  ======================================================= */

  const handleBatteryTypeChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {

    const value =
      e.target.value as BatteryType;

    setFormData((prev) => ({
      ...prev,

      batteryType: value,
      batteryCharger: '0',
    }));

    setSubmitError('');
  };


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = (): boolean => {

    setSubmitError('');


    if (
      !formData.vehicleNo.trim()
    ) {

      setSubmitError(
        'Vehicle number could not be loaded. Please open this page from your participant dashboard.'
      );

      return false;
    }


    if (
      !formData.addOnType
    ) {

      setSubmitError(
        'Please select an add-on type.'
      );

      return false;
    }


    if (
      formData.addOnType ===
      'Servo mounted Ultrasonic'
    ) {

      if (
        formData.ultrasonicSensorHC_SR04 !== '1' ||
        formData.servoSG90 !== '1'
      ) {

        setSubmitError(
          'Servo mounted Ultrasonic requires 1 HC-SR04 and 1 SG90.'
        );

        return false;
      }
    }


    if (
      formData.addOnType ===
      'IR based line follower'
    ) {

      if (
        !['2', '3', '4'].includes(
          formData.noOfIRs
        )
      ) {

        setSubmitError(
          'Please select the number of IR sensors.'
        );

        return false;
      }
    }


    if (
      !formData.chasisType
    ) {

      setSubmitError(
        'Please select one chassis type.'
      );

      return false;
    }


    const totalWheels =
      Number(formData.wheels7x2) +
      Number(formData.wheels7x4) +
      Number(formData.wheels10x4);


    if (
      totalWheels < 1
    ) {

      setSubmitError(
        'Please select at least one wheel type.'
      );

      return false;
    }


    if (
      Number(formData.noOfMotors) < 1
    ) {

      setSubmitError(
        'Please enter the number of motors required.'
      );

      return false;
    }


    if (
      !formData.motorRPM
    ) {

      setSubmitError(
        'Please select the motor RPM.'
      );

      return false;
    }


    if (
      !formData.batteryType
    ) {

      setSubmitError(
        'Please select the battery type.'
      );

      return false;
    }


    if (
      formData.batteryType === 'Li-ion' &&
      formData.batteryCharger !== '1'
    ) {

      setSubmitError(
        'Battery charger is required for Li-ion battery.'
      );

      return false;
    }


    if (
      !formData.paymentSS.trim()
    ) {

      setSubmitError(
        'Please provide the payment screenshot Drive link.'
      );

      return false;
    }


    if (
      !formData.paymentSS
        .trim()
        .startsWith('http')
    ) {

      setSubmitError(
        'Please enter a valid payment screenshot link.'
      );

      return false;
    }


    if (
      !formData.transactionID.trim()
    ) {

      setSubmitError(
        'Please enter the kit payment transaction ID.'
      );

      return false;
    }


    return true;
  };


  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();


    if (!validate()) {

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }


    setLoading(true);
    setSubmitError('');


    try {

      const payload = {

        vehicleNo:
          formData.vehicleNo.trim(),

        teamName:
          teamNameFromURL.trim(),

        addOnType:
          formData.addOnType,

        ultrasonicSensorHC_SR04:
          formData.ultrasonicSensorHC_SR04,

        servoSG90:
          formData.servoSG90,

        noOfIRs:
          formData.addOnType ===
          'IR based line follower'
            ? formData.noOfIRs
            : '0',

        acrylic:
          formData.chasisType ===
          'Acrylic'
            ? '1'
            : '0',

        blackMetalChasis:
          formData.chasisType ===
          'Black metal chasis'
            ? '1'
            : '0',

        whiteMetalChasis:
          formData.chasisType ===
          'White metal chasis'
            ? '1'
            : '0',

        noOfWheels:
          `7x2: ${formData.wheels7x2} | 7x4: ${formData.wheels7x4} | 10x4: ${formData.wheels10x4}`,

        typeOfWheels:
          [
            Number(formData.wheels7x2) > 0
              ? `7x2 (${formData.wheels7x2})`
              : '',

            Number(formData.wheels7x4) > 0
              ? `7x4 (${formData.wheels7x4})`
              : '',

            Number(formData.wheels10x4) > 0
              ? `10x4 (${formData.wheels10x4})`
              : '',
          ]
            .filter(Boolean)
            .join(' | '),

        noOfMotors:
          formData.noOfMotors,

        motorRPM:
          formData.motorRPM,

        controllerBattery:
          '1',

        batteryType:
          formData.batteryType,

        batteryCharger:
          formData.batteryType === 'Li-ion'
            ? formData.batteryCharger
            : '0',

        screwDriver:
          '1',

        paymentSS:
          formData.paymentSS.trim(),

        transactionID:
          formData.transactionID.trim(),
      };


      console.log(
        'Mechanical Kit Payload:',
        payload
      );


      const response =
        await fetch(
          MECHANICAL_KIT_SCRIPT_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'text/plain;charset=utf-8',
            },

            body:
              JSON.stringify(payload),
          }
        );


      let result: any = null;


      try {

        result =
          await response.json();

      } catch {

        result = null;
      }


      console.log(
        'Mechanical Kit Response:',
        result
      );


      if (
        result?.success === true ||
        result?.status === 'success'
      ) {

        setSubmitted(true);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        return;
      }


      if (response.ok) {

        setSubmitted(true);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        return;
      }


      throw new Error(
        result?.message ||
        result?.error ||
        'Submission failed.'
      );

    } catch (error) {

      console.error(
        'Mechanical Kit Submission Error:',
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to submit the form. Please try again.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

    } finally {

      setLoading(false);

    }
  };


  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    !isLoggedIn ||
    !user
  ) {

    return (
      <div className="
        min-h-screen
        bg-[#070D18]
        text-white
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/10
          bg-[#0B1424]
          p-8
          text-center
        ">

          <AlertCircle
            className="
              mx-auto
              mb-4
              h-10
              w-10
              text-amber-400
            "
          />

          <h2 className="
            text-xl
            font-semibold
          ">
            Login Required
          </h2>

          <p className="
            mt-2
            text-sm
            leading-6
            text-slate-400
          ">
            Please login using your IIT Bombay
            SSO account to access the Mechanical
            Kit registration.
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     VEHICLE NUMBER MISSING
  ======================================================= */

  if (!formData.vehicleNo) {

    return (
      <div className="
        min-h-screen
        bg-[#070D18]
        text-white
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          w-full
          max-w-lg
          rounded-2xl
          border
          border-red-500/20
          bg-[#0B1424]
          p-8
          text-center
        ">

          <AlertCircle
            className="
              mx-auto
              mb-4
              h-10
              w-10
              text-red-400
            "
          />

          <h2 className="
            text-xl
            font-semibold
          ">
            Vehicle Number Not Found
          </h2>

          <p className="
            mt-3
            text-sm
            leading-6
            text-slate-400
          ">
            Please open the Mechanical Kit
            Registration from your participant
            dashboard.
          </p>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-amber-400
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-950
              transition
              hover:bg-amber-300
            "
          >

            <ArrowLeft size={17} />

            Back to Dashboard

          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     SUCCESS
  ======================================================= */

  if (submitted) {

    return (
      <div className="
        min-h-screen
        bg-[#070D18]
        text-white
        flex
        items-center
        justify-center
        px-4
        py-12
      ">

        <div className="
          w-full
          max-w-2xl
          rounded-3xl
          border
          border-amber-400/20
          bg-[#0B1424]
          p-8
          text-center
          sm:p-12
        ">

          <div className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-2xl
            border
            border-amber-400/30
            bg-amber-400/10
          ">

            <CheckCircle2
              className="
                h-10
                w-10
                text-amber-400
              "
            />

          </div>

          <h1 className="
            mt-6
            text-2xl
            font-bold
            sm:text-3xl
          ">
            Mechanical Kit Request Submitted
          </h1>

          <p className="
            mt-3
            text-sm
            leading-6
            text-slate-400
          ">
            Your mechanical kit request has been
            successfully recorded for vehicle

            <span className="
              ml-1
              font-semibold
              text-amber-400
            ">
              {formData.vehicleNo}
            </span>
            .
          </p>

          <div className="
            mx-auto
            mt-8
            max-w-sm
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            p-5
            text-left
          ">

            <div className="
              flex
              justify-between
              border-b
              border-white/10
              pb-3
            ">

              <span className="
                text-xs
                uppercase
                tracking-wider
                text-slate-500
              ">
                Vehicle
              </span>

              <span className="
                font-semibold
                text-white
              ">
                {formData.vehicleNo}
              </span>

            </div>

            <div className="
              flex
              justify-between
              gap-4
              border-b
              border-white/10
              py-3
            ">

              <span className="
                text-xs
                uppercase
                tracking-wider
                text-slate-500
              ">
                Team
              </span>

              <span className="
                text-right
                text-sm
                font-medium
                text-slate-200
              ">
                {teamNameFromURL || 'Team'}
              </span>

            </div>

            <div className="
              flex
              justify-between
              gap-4
              pt-3
            ">

              <span className="
                text-xs
                uppercase
                tracking-wider
                text-slate-500
              ">
                Add-on
              </span>

              <span className="
                text-right
                text-sm
                font-medium
                text-slate-200
              ">
                {formData.addOnType}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-amber-400
              px-6
              py-3
              text-sm
              font-semibold
              text-slate-950
              transition
              hover:bg-amber-300
            "
          >

            <ArrowLeft size={17} />

            Back to Dashboard

          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="
      min-h-screen
      bg-[#070D18]
      text-white
    ">

      {/* 
        Extra top spacing added here so the page
        clears the fixed site header.
      */}

      <div className="
        mx-auto
        w-full
        max-w-5xl
        px-4
        pt-28
        pb-8
        sm:px-6
        sm:pt-32
        sm:pb-12
        lg:px-8
      ">

        {/* HEADER */}

        <div className="
          mb-10
          max-w-3xl
        ">

          <div className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-amber-400/20
            bg-amber-400/5
            px-3
            py-1.5
            text-sm
            font-semibold
            tracking-wide
            text-amber-400
          ">
            XLR8 2026
          </div>

          <h1 className="
            text-3xl
            font-bold
            tracking-tight
            sm:text-4xl
          ">
            Mechanical Kit
          </h1>

          <p className="
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-slate-400
            sm:text-base
          ">
            Choose the components your team needs
            for the vehicle. Make sure the quantities
            and payment details are correct before
            submitting.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >

          {/* =================================================
              PARTICIPANT
          ================================================= */}

          <Section
            icon={<User size={18} />}
            title="Participant Details"
            subtitle="Fetched from your participant dashboard"
          >

            <div className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            ">

              <ReadOnlyField
                label="Vehicle Number"
                value={formData.vehicleNo}
                icon={<Car size={15} />}
              />

              <ReadOnlyField
                label="Team Name"
                value={teamNameFromURL || 'Team'}
                icon={<User size={15} />}
              />

            </div>

          </Section>


          {/* =================================================
              ADD-ON
          ================================================= */}

          <Section
            icon={<Package size={18} />}
            title="Add-on"
            subtitle="Choose one configuration for your vehicle"
          >

            <div className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-3
            ">

              <AddOnOption
                selected={
                  formData.addOnType === 'None'
                }
                title="None"
                description="No additional sensor setup"
                onClick={() =>
                  handleAddOnChange('None')
                }
              />

              <AddOnOption
                selected={
                  formData.addOnType ===
                  'Servo mounted Ultrasonic'
                }
                title="Servo mounted Ultrasonic"
                description="HC-SR04 + SG90"
                onClick={() =>
                  handleAddOnChange(
                    'Servo mounted Ultrasonic'
                  )
                }
              />

              <AddOnOption
                selected={
                  formData.addOnType ===
                  'IR based line follower'
                }
                title="IR based line follower"
                description="Choose 2, 3 or 4 IR sensors"
                onClick={() =>
                  handleAddOnChange(
                    'IR based line follower'
                  )
                }
              />

            </div>


            {formData.addOnType ===
              'Servo mounted Ultrasonic' && (

              <div className="
                mt-4
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              ">

                <FixedComponent
                  label="Ultrasonic Sensor HC-SR04"
                  value="1"
                />

                <FixedComponent
                  label="Servo SG90"
                  value="1"
                />

              </div>

            )}


            {formData.addOnType ===
              'IR based line follower' && (

              <div className="
                mt-4
                max-w-sm
              ">

                <SelectField
                  label="No. of IRs"
                  name="noOfIRs"
                  value={formData.noOfIRs}
                  onChange={handleChange}
                  options={[
                    {
                      value: '2',
                      label: '2 IR Sensors',
                    },
                    {
                      value: '3',
                      label: '3 IR Sensors',
                    },
                    {
                      value: '4',
                      label: '4 IR Sensors',
                    },
                  ]}
                />

              </div>

            )}

          </Section>


          {/* =================================================
              CHASSIS
          ================================================= */}

          <Section
            icon={<Box size={18} />}
            title="Chassis"
            subtitle="Select one chassis type"
          >

            <div className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-3
            ">

              <ChasisOption
                title="Acrylic"
                selected={
                  formData.chasisType === 'Acrylic'
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chasisType: 'Acrylic',
                  }))
                }
              />

              <ChasisOption
                title="Black Metal Chassis"
                selected={
                  formData.chasisType ===
                  'Black metal chasis'
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chasisType:
                      'Black metal chasis',
                  }))
                }
              />

              <ChasisOption
                title="White Metal Chassis"
                selected={
                  formData.chasisType ===
                  'White metal chasis'
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chasisType:
                      'White metal chasis',
                  }))
                }
              />

            </div>

          </Section>


          {/* =================================================
              WHEELS
          ================================================= */}

          <Section
            icon={<Cog size={18} />}
            title="Wheels"
            subtitle="Set the quantity for each wheel type"
          >

            <div className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-3
            ">

              <QuantityField
                label="7 × 2"
                value={formData.wheels7x2}
                onMinus={() =>
                  updateQuantity(
                    'wheels7x2',
                    -1
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'wheels7x2',
                    1
                  )
                }
              />

              <QuantityField
                label="7 × 4"
                value={formData.wheels7x4}
                onMinus={() =>
                  updateQuantity(
                    'wheels7x4',
                    -1
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'wheels7x4',
                    1
                  )
                }
              />

              <QuantityField
                label="10 × 4"
                value={formData.wheels10x4}
                onMinus={() =>
                  updateQuantity(
                    'wheels10x4',
                    -1
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'wheels10x4',
                    1
                  )
                }
              />

            </div>

          </Section>


          {/* =================================================
              MOTORS
          ================================================= */}

          <Section
            icon={<Gauge size={18} />}
            title="Motors"
            subtitle="Specify the number and RPM"
          >

            <div className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            ">

              <div>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-300
                ">
                  No. of Motors

                  <span className="
                    ml-1
                    text-amber-400
                  ">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="1"
                  name="noOfMotors"
                  value={formData.noOfMotors}
                  onChange={handleChange}
                  className="
                    h-[50px]
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0B1424]
                    px-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-amber-400/40
                    focus:ring-2
                    focus:ring-amber-400/10
                  "
                  placeholder="Enter quantity"
                />

              </div>


              <SelectField
                label="Motor RPM"
                name="motorRPM"
                value={formData.motorRPM}
                onChange={handleChange}
                options={[
                  {
                    value: '100',
                    label: '100 RPM',
                  },
                  {
                    value: '200',
                    label: '200 RPM',
                  },
                  {
                    value: '300',
                    label: '300 RPM',
                  },
                ]}
              />

            </div>

          </Section>


          {/* =================================================
              BATTERY
          ================================================= */}

          <Section
            icon={<BatteryCharging size={18} />}
            title="Battery & Accessories"
            subtitle="Controller battery and screwdriver are included by default"
          >

            <div className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
            ">

              <FixedComponent
                label="Controller Battery"
                value="1"
              />

              <SelectField
                label="Battery Type"
                name="batteryType"
                value={formData.batteryType}
                onChange={handleBatteryTypeChange}
                options={[
                  {
                    value: 'LiPo',
                    label: 'LiPo',
                  },
                  {
                    value: 'Li-ion',
                    label: 'Li-ion',
                  },
                ]}
              />


              {formData.batteryType ===
                'Li-ion' && (

                <BatteryChargerCheckbox
                  checked={
                    formData.batteryCharger === '1'
                  }
                  onChange={(checked) => {

                    setFormData((prev) => ({
                      ...prev,
                      batteryCharger:
                        checked
                          ? '1'
                          : '0',
                    }));

                    setSubmitError('');

                  }}
                />

              )}


              <FixedComponent
                label="Screw Driver"
                value="1"
              />

            </div>

          </Section>


          {/* =================================================
              PAYMENT
          ================================================= */}

          <Section
            icon={<CreditCard size={18} />}
            title="Payment"
            subtitle="Add the payment proof for your kit"
          >

            <div className="
              grid
              grid-cols-1
              gap-4
            ">

              <InputField
                label="Payment Screenshot"
                name="paymentSS"
                type="url"
                value={formData.paymentSS}
                onChange={handleChange}
                placeholder="Paste Google Drive link"
              />

              <InputField
                label="Transaction ID"
                name="transactionID"
                type="text"
                value={formData.transactionID}
                onChange={handleChange}
                placeholder="Enter payment transaction ID"
              />

            </div>

          </Section>


          {/* =================================================
              ERROR
          ================================================= */}

          {submitError && (

            <div className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-500/20
              bg-red-500/5
              px-4
              py-4
              text-sm
              text-red-300
            ">

              <AlertCircle
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-red-400
                "
              />

              <span>
                {submitError}
              </span>

            </div>

          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="
            flex
            flex-col
            gap-4
            border-t
            border-white/10
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <p className="
              max-w-md
              text-xs
              leading-5
              text-slate-500
            ">
              Check your component quantities and
              payment details before submitting.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-amber-400
                px-7
                py-3.5
                text-sm
                font-bold
                text-slate-950
                transition
                hover:bg-amber-300
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:min-w-[220px]
              "
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />

                  Submit Kit Request
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   SECTION
========================================================= */

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: SectionProps) {

  return (
    <section className="
      rounded-2xl
      border
      border-white/[0.08]
      bg-[#0B1424]/70
      p-5
      sm:p-6
    ">

      <div className="
        mb-5
        flex
        items-center
        gap-3
      ">

        <div className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-white/10
          bg-white/[0.04]
          text-slate-300
        ">
          {icon}
        </div>

        <div>

          <h2 className="
            text-base
            font-semibold
            text-white
          ">
            {title}
          </h2>

          <p className="
            mt-0.5
            text-xs
            text-slate-500
          ">
            {subtitle}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}


/* =========================================================
   ADD-ON OPTION
   SQUARE CHECK INDICATOR
========================================================= */

interface AddOnOptionProps {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}

function AddOnOption({
  selected,
  title,
  description,
  onClick,
}: AddOnOptionProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        min-h-[112px]
        rounded-xl
        border
        p-4
        text-left
        transition-all
        duration-200
        ${
          selected
            ? `
              border-amber-400/50
              bg-amber-400/[0.08]
              shadow-[0_0_0_1px_rgba(251,191,36,0.08)]
            `
            : `
              border-white/[0.09]
              bg-[#0A1322]
              hover:border-white/20
              hover:bg-white/[0.035]
            `
        }
      `}
    >

      <div className="
        flex
        h-full
        items-start
        justify-between
        gap-4
      ">

        <div className="pr-2">

          <p className={`
            text-sm
            font-semibold
            leading-5
            ${
              selected
                ? 'text-amber-400'
                : 'text-slate-200'
            }
          `}>
            {title}
          </p>

          <p className="
            mt-2
            text-xs
            leading-5
            text-slate-500
          ">
            {description}
          </p>

        </div>


        <SelectionBox
          selected={selected}
        />

      </div>

    </button>
  );
}


/* =========================================================
   CHASSIS OPTION
   SQUARE CHECK INDICATOR
========================================================= */

interface ChasisOptionProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

function ChasisOption({
  title,
  selected,
  onClick,
}: ChasisOptionProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        min-h-[64px]
        w-full
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        px-4
        py-3
        text-left
        transition-all
        duration-200
        ${
          selected
            ? `
              border-amber-400/50
              bg-amber-400/[0.08]
            `
            : `
              border-white/[0.09]
              bg-[#0A1322]
              hover:border-white/20
              hover:bg-white/[0.035]
            `
        }
      `}
    >

      <span className={`
        text-sm
        font-semibold
        ${
          selected
            ? 'text-amber-400'
            : 'text-slate-200'
        }
      `}>
        {title}
      </span>

      <SelectionBox
        selected={selected}
      />

    </button>
  );
}


/* =========================================================
   SHARED SQUARE SELECTION BOX
========================================================= */

function SelectionBox({
  selected,
}: {
  selected: boolean;
}) {

  return (
    <span className={`
      flex
      h-5
      w-5
      shrink-0
      items-center
      justify-center
      rounded-[5px]
      border
      transition-all
      duration-200
      ${
        selected
          ? `
            border-amber-400
            bg-amber-400
            text-slate-950
          `
          : `
            border-slate-600
            bg-transparent
            text-transparent
            group-hover:border-slate-400
          `
      }
    `}>

      {selected && (
        <Check
          size={13}
          strokeWidth={3}
        />
      )}

    </span>
  );
}


/* =========================================================
   FIXED COMPONENT
========================================================= */

interface FixedComponentProps {
  label: string;
  value: string;
}

function FixedComponent({
  label,
  value,
}: FixedComponentProps) {

  return (
    <div className="
      rounded-xl
      border
      border-white/[0.08]
      bg-white/[0.025]
      px-4
      py-3.5
    ">

      <div className="
        flex
        items-center
        justify-between
        gap-4
      ">

        <div>

          <p className="
            text-sm
            font-medium
            text-slate-300
          ">
            {label}
          </p>

          <p className="
            mt-1
            text-xs
            text-slate-500
          ">
            Included in the kit
          </p>

        </div>


        <div className="
          flex
          h-7
          min-w-7
          items-center
          justify-center
          rounded-md
          border
          border-white/10
          bg-white/[0.04]
          px-2
          text-xs
          font-semibold
          text-slate-300
        ">
          {value}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   BATTERY CHARGER
   MODERN SQUARE CHECKBOX
========================================================= */

interface BatteryChargerCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function BatteryChargerCheckbox({
  checked,
  onChange,
}: BatteryChargerCheckboxProps) {

  return (
    <label
      className={`
        flex
        min-h-[78px]
        cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        px-4
        py-3.5
        transition-all
        duration-200
        ${
          checked
            ? `
              border-amber-400/40
              bg-amber-400/[0.07]
            `
            : `
              border-white/[0.08]
              bg-[#0A1322]
              hover:border-white/20
              hover:bg-white/[0.035]
            `
        }
      `}
    >

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${
            checked
              ? `
                bg-amber-400/10
                text-amber-400
              `
              : `
                bg-white/[0.04]
                text-slate-500
              `
          }
        `}>

          <BatteryCharging
            size={17}
          />

        </div>


        <div>

          <p className={`
            text-sm
            font-medium
            ${
              checked
                ? 'text-amber-400'
                : 'text-slate-200'
            }
          `}>
            Battery Charger
          </p>

          <p className="
            mt-1
            text-xs
            text-slate-500
          ">
            Required for Li-ion battery
          </p>

        </div>

      </div>


      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="sr-only"
      />


      <span className={`
        flex
        h-5
        w-5
        shrink-0
        items-center
        justify-center
        rounded-[5px]
        border
        transition-all
        duration-200
        ${
          checked
            ? `
              border-amber-400
              bg-amber-400
              text-slate-950
            `
            : `
              border-slate-600
              bg-transparent
            `
        }
      `}>

        {checked && (
          <Check
            size={13}
            strokeWidth={3}
          />
        )}

      </span>

    </label>
  );
}


/* =========================================================
   QUANTITY FIELD
========================================================= */

interface QuantityFieldProps {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}

function QuantityField({
  label,
  value,
  onMinus,
  onPlus,
}: QuantityFieldProps) {

  return (
    <div className="
      rounded-xl
      border
      border-white/[0.08]
      bg-[#0A1322]
      p-4
    ">

      <div className="
        mb-3
        text-sm
        font-medium
        text-slate-300
      ">
        {label}
      </div>

      <div className="
        flex
        items-center
        justify-between
        rounded-lg
        border
        border-white/[0.08]
        bg-white/[0.025]
        p-1
      ">

        <button
          type="button"
          onClick={onMinus}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-md
            text-slate-500
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <Minus size={16} />
        </button>

        <span className="
          min-w-[40px]
          text-center
          text-base
          font-semibold
          text-white
        ">
          {value}
        </span>

        <button
          type="button"
          onClick={onPlus}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-md
            bg-white/[0.05]
            text-slate-300
            transition
            hover:bg-amber-400/10
            hover:text-amber-400
          "
        >
          <Plus size={16} />
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   SELECT
========================================================= */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLSelectElement>
  ) => void;
  options: SelectOption[];
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {

  return (
    <div>

      <label className="
        mb-2
        block
        text-sm
        font-medium
        text-slate-300
      ">

        {label}

        <span className="
          ml-1
          text-amber-400
        ">
          *
        </span>

      </label>


      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          h-[50px]
          w-full
          rounded-xl
          border
          border-white/10
          bg-[#0B1424]
          px-4
          text-sm
          text-white
          outline-none
          transition
          focus:border-amber-400/40
          focus:ring-2
          focus:ring-amber-400/10
        "
      >

        <option
          value=""
          disabled
          className="bg-[#0B1424]"
        >
          Select {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0B1424]"
            >
              {option.label}
            </option>
          )
        )}

      </select>

    </div>
  );
}


/* =========================================================
   INPUT
========================================================= */

interface InputFieldProps {
  label: string;
  name: keyof FormData;
  type: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
}

function InputField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {

  return (
    <div>

      <label className="
        mb-2
        block
        text-sm
        font-medium
        text-slate-300
      ">

        {label}

        <span className="
          ml-1
          text-amber-400
        ">
          *
        </span>

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          h-[50px]
          w-full
          rounded-xl
          border
          border-white/10
          bg-[#0B1424]
          px-4
          text-sm
          text-white
          outline-none
          transition
          placeholder:text-slate-600
          focus:border-amber-400/40
          focus:ring-2
          focus:ring-amber-400/10
        "
      />

    </div>
  );
}


/* =========================================================
   READ ONLY FIELD
========================================================= */

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function ReadOnlyField({
  label,
  value,
  icon,
}: ReadOnlyFieldProps) {

  return (
    <div>

      <label className="
        mb-2
        flex
        items-center
        gap-2
        text-sm
        font-medium
        text-slate-400
      ">

        {icon}

        {label}

      </label>

      <div className="
        flex
        min-h-[50px]
        items-center
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-4
        text-sm
        font-semibold
        text-slate-400
      ">
        {value}
      </div>

    </div>
  );
}