import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
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
  Wrench,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

/* =========================================================
   COMPONENT IMAGES
========================================================= */

import ultrasonicImage from '../assets/ultrasonic.webp';
import servoImage from '../assets/servo.jpg';
import irSensorImage from '../assets/ir-sensor.jpg';

import acrylicChassisImage from '../assets/acrylic_sheet.jpg';
import blackMetalChassisImage from '../assets/black_chasis.jpg';
import whiteMetalChassisImage from '../assets/white_metal_chasis.png';

import wheel7x2Image from '../assets/7x2.webp';
import wheel7x4Image from '../assets/7x4.webp';
import wheel10x4Image from '../assets/10x4.webp';

import motorImage from '../assets/dc-motor.avif';

import controllerBatteryImage from '../assets/li-ion.webp';
import batteryChargerImage from '../assets/battery-charger.jpg';

import lClampImage from '../assets/Lclamps.webp';
import nutBoltsImage from '../assets/nut-bolts.avif';
import screwdriverImage from '../assets/screwdriver.webp';

import Lipo from '../assets/li-po.avif';
import liion from '../assets/li-ion-12v.webp';

import aditya_qr from '../assets/aditya_qr.jpeg';

/* =========================================================
   CONFIG
========================================================= */

const MECHANICAL_KIT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw2PU0qjID-ZVp0vANYyEwckZYslFmB0-3V9ihQKjgRrjOINAVJm_5CRF5bmDPhqoDT/exec';

/* =========================================================
   PRICING
========================================================= */

const PRICES = {
  irSensor: 25,
  ultrasonic: 65,
  servo: 95,
  acrylic: 210,
  blackMetalChasis: 125,
  whiteMetalChasis: 145,
  lClamp: 15,
  nutBolts: 40,
  screwDriver: 60,
  liIon12V: 450,
  controllerBattery: 90,
  liIonCharger: 170,
  liPolymer: 1150,
  motor: 140,
  wheel7x2: 25,
  wheel7x4: 35,
  wheel10x4: 70,
} as const;

/* =========================================================
   TYPES
========================================================= */

type AddOnType =
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

  addOnType: AddOnType[];

  ultrasonicSensorHC_SR04: string;
  servoSG90: string;
  noOfIRs: string;

  chasisType: ChasisType;
  acrylicQty: string;

  wheels7x2: string;
  wheels7x4: string;
  wheels10x4: string;

  noOfMotors: string;
  motorRPM: string;

  controllerBattery: string;
  batteryType: BatteryType;
  batteryCharger: string;

  lClamp: string;
  nutBolts: string;
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

  addOnType: [],

  ultrasonicSensorHC_SR04: '0',
  servoSG90: '0',
  noOfIRs: '0',

  chasisType: '',
  acrylicQty: '1',

  wheels7x2: '0',
  wheels7x4: '0',
  wheels10x4: '0',

  noOfMotors: '4',
  motorRPM: '',

  controllerBattery: '1',
  batteryType: '',
  batteryCharger: '0',

  lClamp: '0',
  nutBolts: '0',
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

  const [checkingRegistration, setCheckingRegistration] =
    useState(true);

  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);

  /* =======================================================
     CHECK EXISTING REGISTRATION
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const checkRegistration = async () => {
      if (!formData.vehicleNo.trim()) {
        setCheckingRegistration(false);
        setAlreadyRegistered(false);
        return;
      }

      setCheckingRegistration(true);

      try {
        const response = await fetch(
          `${MECHANICAL_KIT_SCRIPT_URL}?action=checkRegistration&vehicleNo=${encodeURIComponent(
            formData.vehicleNo.trim()
          )}`
        );

        const result = await response.json();

        if (cancelled) return;

        setAlreadyRegistered(
          result?.alreadyRegistered === true
        );
      } catch (error) {
        console.error(
          'Registration check failed:',
          error
        );

        if (!cancelled) {
          setAlreadyRegistered(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingRegistration(false);
        }
      }
    };

    checkRegistration();

    return () => {
      cancelled = true;
    };
  }, [formData.vehicleNo]);

  /* =======================================================
     LIVE PRICE CALCULATION
  ======================================================= */

  const priceBreakdown = useMemo(() => {
    const irSensorTotal =
      formData.addOnType.includes(
        'IR based line follower'
      )
        ? Number(formData.noOfIRs) * PRICES.irSensor
        : 0;

    const ultrasonicTotal =
      formData.addOnType.includes(
        'Servo mounted Ultrasonic'
      )
        ? Number(formData.ultrasonicSensorHC_SR04) *
          PRICES.ultrasonic
        : 0;

    const servoTotal =
      formData.addOnType.includes(
        'Servo mounted Ultrasonic'
      )
        ? Number(formData.servoSG90) * PRICES.servo
        : 0;

    const chassisTotal =
      formData.chasisType === 'Acrylic'
        ? Number(formData.acrylicQty) * PRICES.acrylic
        : formData.chasisType ===
            'Black metal chasis'
          ? PRICES.blackMetalChasis
          : formData.chasisType ===
              'White metal chasis'
            ? PRICES.whiteMetalChasis
            : 0;

    const wheels7x2Total =
      Number(formData.wheels7x2) *
      PRICES.wheel7x2;

    const wheels7x4Total =
      Number(formData.wheels7x4) *
      PRICES.wheel7x4;

    const wheels10x4Total =
      Number(formData.wheels10x4) *
      PRICES.wheel10x4;

    const motorsTotal =
      Number(formData.noOfMotors) *
      PRICES.motor;

    const controllerBatteryTotal =
      PRICES.controllerBattery;

    const batteryTotal =
      formData.batteryType === 'LiPo'
        ? PRICES.liPolymer
        : formData.batteryType === 'Li-ion'
          ? PRICES.liIon12V
          : 0;

    const chargerTotal =
      formData.batteryType === 'Li-ion' &&
      formData.batteryCharger === '1'
        ? PRICES.liIonCharger
        : 0;

    const lClampTotal =
      Number(formData.lClamp) *
      PRICES.lClamp;

    const nutBoltsTotal =
      Number(formData.nutBolts) *
      PRICES.nutBolts;

    const screwDriverTotal =
      Number(formData.screwDriver) *
      PRICES.screwDriver;

    return {
      irSensor: irSensorTotal,
      ultrasonic: ultrasonicTotal,
      servo: servoTotal,
      chassis: chassisTotal,
      wheels7x2: wheels7x2Total,
      wheels7x4: wheels7x4Total,
      wheels10x4: wheels10x4Total,
      motors: motorsTotal,
      controllerBattery: controllerBatteryTotal,
      battery: batteryTotal,
      charger: chargerTotal,
      lClamp: lClampTotal,
      nutBolts: nutBoltsTotal,
      screwDriver: screwDriverTotal,
    };
  }, [formData]);

  const totalPrice = useMemo(
    () =>
      Object.values(priceBreakdown).reduce<number>(
        (sum, value) => sum + Number(value),
        0
      ),
    [priceBreakdown]
  );

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
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
    amount: number,
    min: number = 0
  ) => {
    setFormData((prev) => {
      const current =
        Number(prev[field]) || 0;

      const next = Math.max(
        min,
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
     ADD-ON MULTI SELECT
     
     Allowed:
     None
     Ultrasonic
     IR
     Ultrasonic + IR

     Not allowed:
     None + Ultrasonic
     None + IR
  ======================================================= */

  const handleAddOnChange = (
    value: AddOnType
  ) => {
    setFormData((prev) => {
      let nextAddOns = [
        ...prev.addOnType,
      ];

      /* None is exclusive */
      if (value === 'None') {
        nextAddOns =
          nextAddOns.includes('None')
            ? []
            : ['None'];
      } else {
        /* Remove None when selecting an actual add-on */
        nextAddOns =
          nextAddOns.filter(
            (item) => item !== 'None'
          );

        /* Toggle selected add-on */
        if (
          nextAddOns.includes(value)
        ) {
          nextAddOns =
            nextAddOns.filter(
              (item) => item !== value
            );
        } else {
          nextAddOns.push(value);
        }
      }

      return {
        ...prev,

        addOnType: nextAddOns,

        ultrasonicSensorHC_SR04:
          nextAddOns.includes(
            'Servo mounted Ultrasonic'
          )
            ? '1'
            : '0',

        servoSG90:
          nextAddOns.includes(
            'Servo mounted Ultrasonic'
          )
            ? '1'
            : '0',

        noOfIRs:
          nextAddOns.includes(
            'IR based line follower'
          )
            ? prev.noOfIRs === '0'
              ? '2'
              : prev.noOfIRs
            : '0',
      };
    });

    setSubmitError('');
  };

  /* =======================================================
     BATTERY TYPE
  ======================================================= */

  const handleBatteryTypeChangeValue = (
    value: BatteryType
  ) => {
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

    if (!formData.vehicleNo.trim()) {
      setSubmitError(
        'Vehicle number could not be loaded. Please open this page from your participant dashboard.'
      );
      return false;
    }

    if (formData.addOnType.length === 0) {
      setSubmitError(
        'Please select at least one add-on option.'
      );
      return false;
    }

    if (
      formData.addOnType.includes('None') &&
      formData.addOnType.length > 1
    ) {
      setSubmitError(
        'None cannot be selected together with another add-on.'
      );
      return false;
    }

    if (
      formData.addOnType.includes(
        'Servo mounted Ultrasonic'
      )
    ) {
      if (
        Number(
          formData.ultrasonicSensorHC_SR04
        ) < 1 ||
        Number(formData.servoSG90) < 1
      ) {
        setSubmitError(
          'Servo mounted Ultrasonic requires at least 1 HC-SR04 and 1 SG90.'
        );
        return false;
      }
    }

    if (
      formData.addOnType.includes(
        'IR based line follower'
      )
    ) {
      if (
        Number(formData.noOfIRs) < 2
      ) {
        setSubmitError(
          'Please select at least 2 IR sensors.'
        );
        return false;
      }
    }

    if (!formData.chasisType) {
      setSubmitError(
        'Please select one chassis type.'
      );
      return false;
    }

    const totalWheels =
      Number(formData.wheels7x2) +
      Number(formData.wheels7x4) +
      Number(formData.wheels10x4);

    if (totalWheels < 1) {
      setSubmitError(
        'Please select at least one wheel type.'
      );
      return false;
    }

    /* 10x4 only with Acrylic */
    if (
      Number(formData.wheels10x4) > 0 &&
      formData.chasisType !== 'Acrylic'
    ) {
      setSubmitError(
        '10 × 4 wheels can only be selected with Acrylic chassis.'
      );
      return false;
    }

    /* L clamp only with Acrylic */
    if (
      Number(formData.lClamp) > 0 &&
      formData.chasisType !== 'Acrylic'
    ) {
      setSubmitError(
        'L Clamps can only be selected with Acrylic chassis.'
      );
      return false;
    }

    if (
      Number(formData.noOfMotors) < 4
    ) {
      setSubmitError(
        'A minimum of 4 motors is required.'
      );
      return false;
    }

    if (!formData.motorRPM) {
      setSubmitError(
        'Please select the motor RPM.'
      );
      return false;
    }

    if (!formData.batteryType) {
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

    if (!formData.paymentSS.trim()) {
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

    if (!formData.transactionID.trim()) {
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

        /*
          Send as string for Apps Script / Google Sheets
        */
        addOnType:
          formData.addOnType.join(' | '),

        ultrasonicSensorHC_SR04:
          formData.addOnType.includes(
            'Servo mounted Ultrasonic'
          )
            ? formData.ultrasonicSensorHC_SR04
            : '0',

        servoSG90:
          formData.addOnType.includes(
            'Servo mounted Ultrasonic'
          )
            ? formData.servoSG90
            : '0',

        noOfIRs:
          formData.addOnType.includes(
            'IR based line follower'
          )
            ? formData.noOfIRs
            : '0',

        acrylic:
          formData.chasisType ===
          'Acrylic'
            ? '1'
            : '0',

        acrylicQty:
          formData.chasisType === 'Acrylic'
            ? formData.acrylicQty
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

        typeOfWheels: [
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

        lClamp:
          formData.lClamp,

        nutBolts:
          formData.nutBolts,

        screwDriver:
          formData.screwDriver,

        total: totalPrice,
        totalPrice,

        priceBreakdown:
          JSON.stringify(priceBreakdown),

        irSensorTotal:
          priceBreakdown.irSensor,

        ultrasonicTotal:
          priceBreakdown.ultrasonic,

        servoTotal:
          priceBreakdown.servo,

        chassisTotal:
          priceBreakdown.chassis,

        wheels7x2Total:
          priceBreakdown.wheels7x2,

        wheels7x4Total:
          priceBreakdown.wheels7x4,

        wheels10x4Total:
          priceBreakdown.wheels10x4,

        motorsTotal:
          priceBreakdown.motors,

        controllerBatteryTotal:
          priceBreakdown.controllerBattery,

        batteryTotal:
          priceBreakdown.battery,

        chargerTotal:
          priceBreakdown.charger,

        lClampTotal:
          priceBreakdown.lClamp,

        nutBoltsTotal:
          priceBreakdown.nutBolts,

        screwDriverTotal:
          priceBreakdown.screwDriver,

        irSensorUnitPrice:
          PRICES.irSensor,

        ultrasonicUnitPrice:
          PRICES.ultrasonic,

        servoUnitPrice:
          PRICES.servo,

        chassisPrice:
          priceBreakdown.chassis,

        wheel7x2UnitPrice:
          PRICES.wheel7x2,

        wheel7x4UnitPrice:
          PRICES.wheel7x4,

        wheel10x4UnitPrice:
          PRICES.wheel10x4,

        motorUnitPrice:
          PRICES.motor,

        controllerBatteryPrice:
          PRICES.controllerBattery,

        batteryPrice:
          priceBreakdown.battery,

        batteryChargerPrice:
          priceBreakdown.charger,

        lClampUnitPrice:
          PRICES.lClamp,

        nutBoltsUnitPrice:
          PRICES.nutBolts,

        screwDriverUnitPrice:
          PRICES.screwDriver,

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
        result?.alreadyRegistered === true ||
        result?.status ===
          'already_registered'
      ) {
        setAlreadyRegistered(true);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        return;
      }

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

  if (!isLoggedIn || !user) {
    return (
      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-white/10
            bg-[#0B1424]
            p-8
            text-center
          "
        >
          <AlertCircle
            className="
              mx-auto
              mb-4
              h-10
              w-10
              text-amber-400
            "
          />

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            Login Required
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-400
            "
          >
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
      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-2xl
            border
            border-red-500/20
            bg-[#0B1424]
            p-8
            text-center
          "
        >
          <AlertCircle
            className="
              mx-auto
              mb-4
              h-10
              w-10
              text-red-400
            "
          />

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            Vehicle Number Not Found
          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
            "
          >
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
     CHECKING REGISTRATION
  ======================================================= */

  if (checkingRegistration) {
    return (
      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div className="text-center">
          <Loader2
            size={32}
            className="
              mx-auto
              animate-spin
              text-amber-400
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-400
            "
          >
            Checking registration...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ALREADY REGISTERED
  ======================================================= */

  if (alreadyRegistered) {
    return (
      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
          py-12
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            border-amber-400/20
            bg-[#0B1424]
            p-8
            text-center
            shadow-2xl
            sm:p-10
          "
        >
          <div
            className="
              mx-auto
              mb-6
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-amber-400/25
              bg-amber-400/10
            "
          >
            <CheckCircle2
              size={34}
              className="text-amber-400"
            />
          </div>

          <h2
            className="
              text-2xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Already Registered
          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
            "
          >
            This team has already registered
            for the Mechanical Kit.
          </p>

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-5
              py-4
              text-left
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Vehicle Number
              </span>

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-100
                "
              >
                {formData.vehicleNo}
              </span>
            </div>

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                gap-4
                border-t
                border-white/[0.06]
                pt-3
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Team
              </span>

              <span
                className="
                  text-right
                  text-sm
                  font-medium
                  text-slate-200
                "
              >
                {teamNameFromURL || 'Team'}
              </span>
            </div>
          </div>

          <p
            className="
              mt-5
              text-xs
              leading-5
              text-slate-500
            "
          >
            A Mechanical Kit registration has
            already been submitted for this
            vehicle.
          </p>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white/[0.06]
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-200
              transition
              hover:bg-white/[0.1]
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
      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
          py-12
        "
      >
        <div
          className="
            w-full
            max-w-2xl
            rounded-3xl
            border
            border-amber-400/20
            bg-[#0B1424]
            p-8
            text-center
            sm:p-12
          "
        >
          <div
            className="
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
            "
          >
            <CheckCircle2
              className="
                h-10
                w-10
                text-amber-400
              "
            />
          </div>

          <h1
            className="
              mt-6
              text-2xl
              font-bold
              sm:text-3xl
            "
          >
            Mechanical Kit Registration Form Submitted
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
            "
          >
            Your mechanical kit request has
            been successfully recorded for
            vehicle

            <span
              className="
                ml-1
                font-semibold
                text-amber-400
              "
            >
              {formData.vehicleNo}
            </span>
            .
          </p>

          <div
            className="
              mx-auto
              mt-8
              max-w-sm
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              text-left
            "
          >
            <div
              className="
                flex
                justify-between
                border-b
                border-white/10
                pb-3
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Vehicle
              </span>

              <span
                className="
                  font-semibold
                  text-white
                "
              >
                {formData.vehicleNo}
              </span>
            </div>

            <div
              className="
                flex
                justify-between
                gap-4
                border-b
                border-white/10
                py-3
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Team
              </span>

              <span
                className="
                  text-right
                  text-sm
                  font-medium
                  text-slate-200
                "
              >
                {teamNameFromURL || 'Team'}
              </span>
            </div>

            <div
              className="
                flex
                justify-between
                gap-4
                pt-3
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Add-on
              </span>

              <span
                className="
                  text-right
                  text-sm
                  font-medium
                  text-slate-200
                "
              >
                {formData.addOnType.join(' + ')}
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
    <div
      className="
        min-h-screen
        bg-[#070D18]
        text-white
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          pt-28
          pb-8
          sm:px-6
          sm:pt-32
          sm:pb-12
          lg:px-8
        "
      >
        {/* HEADER */}

        <div
          className="
            mb-10
            max-w-3xl
          "
        >
          <div
            className="
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
            "
          >
            XLR8 2026
          </div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            "
          >
            Mechanical Kit Registration
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-slate-400
              sm:text-base
            "
          >
            Choose the components your team
            needs for the vehicle. Adjust
            quantities and make sure your
            payment details are correct before
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
            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              <ReadOnlyField
                label="Vehicle Number"
                value={formData.vehicleNo}
                icon={<Car size={15} />}
              />

              <ReadOnlyField
                label="Team Name"
                value={
                  teamNameFromURL || 'Team'
                }
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
            subtitle="Select one or both add-ons. None cannot be combined with another option."
          >
            <div
              className="
                grid
                grid-cols-1
                gap-3
                md:grid-cols-3
              "
            >
              <AddOnOption
                selected={formData.addOnType.includes(
                  'None'
                )}
                title="None"
                description="No additional sensor setup"
                price="₹0"
                onClick={() =>
                  handleAddOnChange('None')
                }
              />

              <AddOnOption
                selected={formData.addOnType.includes(
                  'Servo mounted Ultrasonic'
                )}
                title="Servo mounted Ultrasonic"
                description="HC-SR04 + SG90"
                // price={`₹${
                //   PRICES.ultrasonic +
                //   PRICES.servo
                // }`}
                onClick={() =>
                  handleAddOnChange(
                    'Servo mounted Ultrasonic'
                  )
                }
              />

              <AddOnOption
                selected={formData.addOnType.includes(
                  'IR based line follower'
                )}
                title="IR based line follower"
                description="Choose 2, 3 or 4 IR sensors"
                // price={`₹${PRICES.irSensor} each`}
                onClick={() =>
                  handleAddOnChange(
                    'IR based line follower'
                  )
                }
              />
            </div>

            {/* ULTRASONIC */}

            {formData.addOnType.includes(
              'Servo mounted Ultrasonic'
            ) && (
              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >
                <QuantityField
                  label="Ultrasonic Sensor HC-SR04"
                  value={
                    formData.ultrasonicSensorHC_SR04
                  }
                  unitPrice={
                    PRICES.ultrasonic
                  }
                  image={ultrasonicImage}
                  onMinus={() =>
                    updateQuantity(
                      'ultrasonicSensorHC_SR04',
                      -1,
                      1
                    )
                  }
                  onPlus={() =>
                    updateQuantity(
                      'ultrasonicSensorHC_SR04',
                      1,
                      1
                    )
                  }
                />

                <QuantityField
                  label="Servo SG90"
                  value={
                    formData.servoSG90
                  }
                  unitPrice={PRICES.servo}
                  image={servoImage}
                  onMinus={() =>
                    updateQuantity(
                      'servoSG90',
                      -1,
                      1
                    )
                  }
                  onPlus={() =>
                    updateQuantity(
                      'servoSG90',
                      1,
                      1
                    )
                  }
                />
              </div>
            )}

            {/* IR */}

            {formData.addOnType.includes(
              'IR based line follower'
            ) && (
              <div
                className="
                  mt-4
                  max-w-sm
                "
              >
                <QuantityField
                  label="IR Sensor"
                  value={
                    formData.noOfIRs
                  }
                  unitPrice={
                    PRICES.irSensor
                  }
                  image={irSensorImage}
                  onMinus={() =>
                    updateQuantity(
                      'noOfIRs',
                      -1,
                      2
                    )
                  }
                  onPlus={() =>
                    updateQuantity(
                      'noOfIRs',
                      1,
                      2
                    )
                  }
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
            <div
              className="
                grid
                grid-cols-1
                gap-3
                md:grid-cols-3
              "
            >
              <ChasisOption
                title="Acrylic(30cmx30cmx5mm)"
                image={acrylicChassisImage}
                price={PRICES.acrylic}
                selected={
                  formData.chasisType ===
                  'Acrylic'
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chasisType:
                      'Acrylic',
                    acrylicQty:
                      prev.chasisType ===
                      'Acrylic'
                        ? prev.acrylicQty
                        : '1',
                  }))
                }
              />

              <ChasisOption
                title="Black Metal Chassis"
                image={
                  blackMetalChassisImage
                }
                price={
                  PRICES.blackMetalChasis
                }
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
                image={
                  whiteMetalChassisImage
                }
                price={
                  PRICES.whiteMetalChasis
                }
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

            {formData.chasisType ===
              'Acrylic' && (
              <div
                className="
                  mt-4
                  max-w-sm
                "
              >
                <QuantityField
                  label="No of acrylic Sheets"
                  value={
                    formData.acrylicQty
                  }
                  unitPrice={
                    PRICES.acrylic
                  }
                  image={
                    acrylicChassisImage
                  }
                  onMinus={() =>
                    updateQuantity(
                      'acrylicQty',
                      -1,
                      1
                    )
                  }
                  onPlus={() =>
                    updateQuantity(
                      'acrylicQty',
                      1,
                      1
                    )
                  }
                />
              </div>
            )}
          </Section>

          {/* =================================================
              WHEELS
          ================================================= */}

          <Section
            icon={<Cog size={18} />}
            title="Wheels"
            subtitle="Set the quantity for each wheel type"
          >
            <div
              className="
                grid
                grid-cols-1
                gap-3
                md:grid-cols-3
              "
            >
              <QuantityField
                label="7 × 2"
                value={
                  formData.wheels7x2
                }
                unitPrice={
                  PRICES.wheel7x2
                }
                image={
                  wheel7x2Image
                }
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
                value={
                  formData.wheels7x4
                }
                unitPrice={
                  PRICES.wheel7x4
                }
                image={
                  wheel7x4Image
                }
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
                value={
                  formData.wheels10x4
                }
                unitPrice={
                  PRICES.wheel10x4
                }
                image={
                  wheel10x4Image
                }
                caution="Select only if Acrylic chassis is chosen"
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
            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              <QuantityField
                label="No. of Motors (min 4)"
                value={
                  formData.noOfMotors
                }
                unitPrice={
                  PRICES.motor
                }
                image={motorImage}
                onMinus={() =>
                  updateQuantity(
                    'noOfMotors',
                    -1,
                    4
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'noOfMotors',
                    1,
                    4
                  )
                }
              />

              <SelectField
                label="Motor RPM"
                name="motorRPM"
                value={
                  formData.motorRPM
                }
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
            icon={
              <BatteryCharging
                size={18}
              />
            }
            title="Battery"
            subtitle="Select the battery required for your vehicle"
          >
            <div
              className="
                grid
                grid-cols-1
                gap-3
                md:grid-cols-3
              "
            >
              <FixedComponent
                label="Controller Battery · 3.7V"
                value="1"
                image={
                  controllerBatteryImage
                }
                unitPrice={
                  PRICES.controllerBattery
                }
              />

              <BatteryOption
                title="LiPo Battery"
                description="Li-polymer 12V battery"
                price={
                  PRICES.liPolymer
                }
                selected={
                  formData.batteryType ===
                  'LiPo'
                }
                image={Lipo}
                onClick={() =>
                  handleBatteryTypeChangeValue(
                    'LiPo'
                  )
                }
              />

              <BatteryOption
                title="Li-ion 12V Battery"
                description="12V Li-ion battery"
                price={
                  PRICES.liIon12V
                }
                selected={
                  formData.batteryType ===
                  'Li-ion'
                }
                image={liion}
                onClick={() =>
                  handleBatteryTypeChangeValue(
                    'Li-ion'
                  )
                }
              />
            </div>

            {formData.batteryType ===
              'Li-ion' && (
              <div className="mt-4">
                <BatteryChargerCheckbox
                  checked={
                    formData.batteryCharger ===
                    '1'
                  }
                  image={
                    batteryChargerImage
                  }
                  price={
                    PRICES.liIonCharger
                  }
                  onChange={(checked) => {
                    setFormData(
                      (prev) => ({
                        ...prev,
                        batteryCharger:
                          checked
                            ? '1'
                            : '0',
                      })
                    );

                    setSubmitError('');
                  }}
                />
              </div>
            )}
          </Section>

          {/* =================================================
              HARDWARE COMPONENTS
          ================================================= */}

          <Section
            icon={<Wrench size={18} />}
            title="Hardware Components"
            subtitle="Choose the quantities required for your build"
          >
            <div
              className="
                grid
                grid-cols-1
                gap-3
                md:grid-cols-2
              "
            >
              <QuantityField
                label="L Clamp"
                value={
                  formData.lClamp
                }
                unitPrice={
                  PRICES.lClamp
                }
                image={lClampImage}
                caution="Select only if Acrylic chassis is chosen"
                onMinus={() =>
                  updateQuantity(
                    'lClamp',
                    -1
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'lClamp',
                    1
                  )
                }
              />

              <QuantityField
                label="Nut & Bolts (One pack contains 8 Nos. which is sufficient for 1 vehicle)"
                value={
                  formData.nutBolts
                }
                unitPrice={
                  PRICES.nutBolts
                }
                image={
                  nutBoltsImage
                }
                onMinus={() =>
                  updateQuantity(
                    'nutBolts',
                    -1
                  )
                }
                onPlus={() =>
                  updateQuantity(
                    'nutBolts',
                    1
                  )
                }
              />
            </div>
          </Section>

          {/* =================================================
              EXTRA ACCESSORIES
          ================================================= */}

          <Section
            icon={<Wrench size={18} />}
            title="Extra Accessories"
            subtitle="Included accessories for the mechanical kit"
          >
            <IncludedComponent
              label="Screw Driver"
              image={
                screwdriverImage
              }
              unitPrice={
                PRICES.screwDriver
              }
            />
          </Section>

          {/* =================================================
              TOTAL PRICE
          ================================================= */}

          <PriceSummary
            formData={formData}
            priceBreakdown={
              priceBreakdown
            }
            totalPrice={totalPrice}
          />

          {/* =================================================
              PAYMENT
          ================================================= */}

          <Section
            icon={<CreditCard size={18} />}
            title="Payment"
            subtitle="Add the payment proof for your kit"
          >
            <div
              className="
                mb-6
                flex
                flex-col
                items-center
                rounded-2xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-5
              "
            >
              <p
                className="
                  mb-4
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Scan to Pay
              </p>

              <div
                className="
                  rounded-2xl
                  bg-white
                  p-4
                  shadow-lg
                "
              >
                <img
                  src={aditya_qr}
                  alt="Aditya payment QR code"
                  className="
                    h-72
                    w-72
                    object-contain
                    sm:h-80
                    sm:w-80
                    lg:h-96
                    lg:w-96
                  "
                />
              </div>

              <p
                className="
                  mt-4
                  max-w-md
                  text-center
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Complete the payment using
                the QR above, then enter your
                transaction details below.
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
              "
            >
              <InputField
                label="Payment Screenshot"
                name="paymentSS"
                type="url"
                value={
                  formData.paymentSS
                }
                onChange={handleChange}
                placeholder="Paste Google Drive link"
              />

              <InputField
                label="Transaction ID"
                name="transactionID"
                type="text"
                value={
                  formData.transactionID
                }
                onChange={handleChange}
                placeholder="Enter payment transaction ID"
              />
            </div>
          </Section>

          {/* =================================================
              ERROR
          ================================================= */}

          {submitError && (
            <div
              className="
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
              "
            >
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

          <div
            className="
              flex
              flex-col
              gap-4
              border-t
              border-white/10
              pt-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                max-w-md
                text-xs
                leading-5
                text-slate-500
              "
            >
              Check your component quantities
              and payment details before
              submitting.
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
                  Submit Registration Form 
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
    <section
      className="
        rounded-2xl
        border
        border-white/[0.08]
        bg-[#0B1424]/70
        p-5
        sm:p-6
      "
    >
      <div
        className="
          mb-5
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
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
          "
        >
          {icon}
        </div>

        <div>
          <h2
            className="
              text-base
              font-semibold
              text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
            "
          >
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   COMPONENT IMAGE
========================================================= */

function ComponentImage({
  src,
  alt,
  size = 'md',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      className={`
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        ${
          size === 'sm'
            ? 'h-20 w-20'
            : size === 'lg'
              ? 'h-32 w-32'
              : 'h-24 w-24'
        }
      `}
    >
      <img
        src={src}
        alt={alt}
        className="
          h-full
          w-full
          object-contain
        "
      />
    </div>
  );
}

/* =========================================================
   ADD-ON OPTION
========================================================= */

interface AddOnOptionProps {
  selected: boolean;
  title: string;
  description: string;
  price?: string;
  onClick: () => void;
}

function AddOnOption({
  selected,
  title,
  description,
  price,
  onClick,
}: AddOnOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        flex
        min-h-[150px]
        flex-col
        justify-between
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
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${
              selected
                ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                : 'border-white/[0.07] bg-white/[0.025] text-slate-500'
            }
          `}
        >
          <Package size={22} />
        </div>

        <SelectionBox
          selected={selected}
        />
      </div>

      <div className="mt-4">
        <p
          className={`
            text-sm
            font-semibold
            leading-5
            ${
              selected
                ? 'text-amber-400'
                : 'text-slate-200'
            }
          `}
        >
          {title}
        </p>

        {price && (
          <p
            className="
              mt-1
              text-xs
              font-semibold
              text-amber-400/80
            "
          >
            {price}
          </p>
        )}

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   CHASSIS OPTION
========================================================= */

interface ChasisOptionProps {
  title: string;
  selected: boolean;
  image: string;
  price: number;
  onClick: () => void;
}

function ChasisOption({
  title,
  selected,
  image,
  price,
  onClick,
}: ChasisOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        flex
        min-h-[220px]
        w-full
        flex-col
        items-center
        gap-3
        rounded-xl
        border
        p-4
        text-center
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
      <div
        className="
          absolute
          right-3
          top-3
        "
      >
        <SelectionBox
          selected={selected}
        />
      </div>

      <ComponentImage
        src={image}
        alt={title}
        size="lg"
      />

      <div>
        <p
          className={`
            text-sm
            font-semibold
            ${
              selected
                ? 'text-amber-400'
                : 'text-slate-200'
            }
          `}
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            font-medium
            text-slate-500
          "
        >
          ₹{price}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   SELECTION BOX
========================================================= */

function SelectionBox({
  selected,
}: {
  selected: boolean;
}) {
  return (
    <span
      className={`
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
      `}
    >
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
  image?: string;
  unitPrice?: number;
}

function FixedComponent({
  label,
  value,
  image,
  unitPrice,
}: FixedComponentProps) {
  return (
    <div
      className="
        flex
        min-h-[108px]
        items-center
        gap-4
        rounded-xl
        border
        border-white/[0.08]
        bg-white/[0.025]
        px-4
        py-3
      "
    >
      {image && (
        <ComponentImage
          src={image}
          alt={label}
          size="md"
        />
      )}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-sm
            font-medium
            text-slate-300
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-slate-500
          "
        >
          {unitPrice !== undefined
            ? `₹${unitPrice} each`
            : 'Included in the kit'}
        </p>
      </div>

      <div
        className="
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
        "
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   INCLUDED COMPONENT
========================================================= */

interface IncludedComponentProps {
  label: string;
  image: string;
  unitPrice?: number;
}

function IncludedComponent({
  label,
  image,
  unitPrice,
}: IncludedComponentProps) {
  return (
    <div
      className="
        relative
        flex
        min-h-[220px]
        w-full
        max-w-[220px]
        flex-col
        items-center
        gap-3
        rounded-xl
        border
        border-amber-400/50
        bg-amber-400/[0.08]
        p-4
        text-center
      "
    >
      <div
        className="
          absolute
          right-3
          top-3
        "
      >
        <SelectionBox selected />
      </div>

      <ComponentImage
        src={image}
        alt={label}
        size="lg"
      />

      <div>
        <p
          className="
            text-sm
            font-semibold
            text-amber-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-xs
            font-medium
            text-slate-500
          "
        >
          {unitPrice !== undefined
            ? `₹${unitPrice} each`
            : 'Included in the kit'}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   BATTERY OPTION
========================================================= */

interface BatteryOptionProps {
  title: string;
  description: string;
  price: number;
  selected: boolean;
  image: string;
  onClick: () => void;
}

function BatteryOption({
  title,
  description,
  price,
  selected,
  image,
  onClick,
}: BatteryOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        flex
        min-h-[240px]
        w-full
        flex-col
        items-center
        gap-3
        rounded-xl
        border
        p-4
        text-center
        transition-all
        duration-200
        ${
          selected
            ? 'border-amber-400/50 bg-amber-400/[0.08]'
            : 'border-white/[0.09] bg-[#0A1322] hover:border-white/20 hover:bg-white/[0.035]'
        }
      `}
    >
      <div
        className="
          absolute
          right-3
          top-3
        "
      >
        <SelectionBox
          selected={selected}
        />
      </div>

      <ComponentImage
        src={image}
        alt={title}
        size="lg"
      />

      <div>
        <p
          className={`
            text-sm
            font-semibold
            ${
              selected
                ? 'text-amber-400'
                : 'text-slate-200'
            }
          `}
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>

        <p
          className="
            mt-1
            text-xs
            font-semibold
            text-amber-400/80
          "
        >
          ₹{price.toLocaleString('en-IN')}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   PRICE SUMMARY
========================================================= */

function PriceSummary({
  formData,
  priceBreakdown,
  totalPrice,
}: {
  formData: FormData;
  priceBreakdown: Record<
    string,
    number
  >;
  totalPrice: number;
}) {
  const rows: Array<
    [string, number]
  > = [];

  if (priceBreakdown.irSensor)
    rows.push([
      `IR Sensors × ${formData.noOfIRs}`,
      priceBreakdown.irSensor,
    ]);

  if (priceBreakdown.ultrasonic)
    rows.push([
      `HC-SR04 × ${formData.ultrasonicSensorHC_SR04}`,
      priceBreakdown.ultrasonic,
    ]);

  if (priceBreakdown.servo)
    rows.push([
      `SG90 Servo × ${formData.servoSG90}`,
      priceBreakdown.servo,
    ]);

  if (priceBreakdown.chassis) {
    rows.push([
      formData.chasisType ===
      'Acrylic'
        ? `Acrylic sheet × ${formData.acrylicQty}`
        : `${formData.chasisType} chassis`,
      priceBreakdown.chassis,
    ]);
  }

  if (priceBreakdown.wheels7x2)
    rows.push([
      `7 × 2 wheels × ${formData.wheels7x2}`,
      priceBreakdown.wheels7x2,
    ]);

  if (priceBreakdown.wheels7x4)
    rows.push([
      `7 × 4 wheels × ${formData.wheels7x4}`,
      priceBreakdown.wheels7x4,
    ]);

  if (priceBreakdown.wheels10x4)
    rows.push([
      `10 × 4 wheels × ${formData.wheels10x4}`,
      priceBreakdown.wheels10x4,
    ]);

  if (priceBreakdown.motors)
    rows.push([
      `Motors × ${formData.noOfMotors}`,
      priceBreakdown.motors,
    ]);

  if (priceBreakdown.controllerBattery)
    rows.push([
      'Controller battery · 3.7V',
      priceBreakdown.controllerBattery,
    ]);

  if (priceBreakdown.battery)
    rows.push([
      formData.batteryType ===
      'LiPo'
        ? 'LiPo battery'
        : 'Li-ion 12V battery',
      priceBreakdown.battery,
    ]);

  if (priceBreakdown.charger)
    rows.push([
      'Li-ion charger',
      priceBreakdown.charger,
    ]);

  if (priceBreakdown.lClamp)
    rows.push([
      `L clamps × ${formData.lClamp}`,
      priceBreakdown.lClamp,
    ]);

  if (priceBreakdown.nutBolts)
    rows.push([
      `Nut & bolt packs × ${formData.nutBolts}`,
      priceBreakdown.nutBolts,
    ]);

  if (priceBreakdown.screwDriver)
    rows.push([
      'Screw driver × 1',
      priceBreakdown.screwDriver,
    ]);

  return (
    <section
      className="
        rounded-2xl
        border
        border-amber-400/20
        bg-[#0B1424]/80
        p-5
        sm:p-6
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-base
              font-semibold
              text-white
            "
          >
            Estimated Kit Total
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Calculated from the quantities
            selected above
          </p>
        </div>

        <div className="text-right">
          <p
            className="
              text-2xl
              font-bold
              text-amber-400
            "
          >
            ₹
            {totalPrice.toLocaleString(
              'en-IN'
            )}
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <div
          className="
            mt-5
            space-y-2
            border-t
            border-white/[0.08]
            pt-4
          "
        >
          {rows.map(
            ([label, amount]) => (
              <div
                key={label}
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-sm
                "
              >
                <span className="text-slate-400">
                  {label}
                </span>

                <span
                  className="
                    font-medium
                    text-slate-200
                  "
                >
                  ₹
                  {amount.toLocaleString(
                    'en-IN'
                  )}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   BATTERY CHARGER
========================================================= */

interface BatteryChargerCheckboxProps {
  checked: boolean;
  image: string;
  price: number;
  onChange: (
    checked: boolean
  ) => void;
}

function BatteryChargerCheckbox({
  checked,
  image,
  price,
  onChange,
}: BatteryChargerCheckboxProps) {
  return (
    <label
      className={`
        flex
        min-h-[108px]
        cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        px-4
        py-3
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
      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <ComponentImage
          src={image}
          alt="Battery Charger"
          size="md"
        />

        <div>
          <p
            className={`
              text-sm
              font-medium
              ${
                checked
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }
            `}
          >
            Battery Charger
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Required for Li-ion battery · ₹
            {price}
          </p>
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked
          )
        }
        className="sr-only"
      />

      <span
        className={`
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
        `}
      >
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
  image: string;
  unitPrice: number;
  caution?: string;
  onMinus: () => void;
  onPlus: () => void;
}

function QuantityField({
  label,
  value,
  image,
  unitPrice,
  caution,
  onMinus,
  onPlus,
}: QuantityFieldProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        gap-3
        rounded-xl
        border
        border-white/[0.08]
        bg-[#0A1322]
        p-4
        text-center
      "
    >
      <ComponentImage
        src={image}
        alt={label}
        size="lg"
      />

      <div>
        <div
          className="
            text-sm
            font-semibold
            text-slate-300
          "
        >
          {label}
        </div>

        <div
          className="
            mt-1
            text-xs
            text-slate-500
          "
        >
          ₹{unitPrice} each · ₹
          {Number(value) *
            unitPrice}{' '}
          total
        </div>

        {caution && (
          <div
            className="
              mt-2
              flex
              items-start
              justify-center
              gap-1.5
              rounded-lg
              border
              border-amber-400/20
              bg-amber-400/[0.06]
              px-2.5
              py-1.5
              text-left
            "
          >
            <AlertCircle
              size={13}
              className="
                mt-[1px]
                shrink-0
                text-amber-400/80
              "
            />

            <span
              className="
                text-[11px]
                leading-4
                text-amber-300/90
              "
            >
              {caution}
            </span>
          </div>
        )}
      </div>

      <div
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.025]
          p-1
        "
      >
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

        <span
          className="
            min-w-[40px]
            text-center
            text-base
            font-semibold
            text-white
          "
        >
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
      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-300
        "
      >
        {label}

        <span
          className="
            ml-1
            text-amber-400
          "
        >
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
      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-300
        "
      >
        {label}

        <span
          className="
            ml-1
            text-amber-400
          "
        >
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
      <label
        className="
          mb-2
          flex
          items-center
          gap-2
          text-sm
          font-medium
          text-slate-400
        "
      >
        {icon}
        {label}
      </label>

      <div
        className="
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
        "
      >
        {value}
      </div>
    </div>
  );
}
