import * as yup from "yup";
import { useState } from "react";
import countries from "../../utils/Countries";
import { avatars } from "../../utils/Data";
import useLoginStore from "../../store/useLoginStore";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useThemeStore from "../../store/useThemeStore";
import { easeInOut, motion } from "framer-motion";
import { FaArrowLeft, FaPlus, FaUser } from "react-icons/fa";
import Spinner from "../../utils/Spinner";
import { sendOtp, updateProfile, verifyOtp } from "../../services/user.service";
import { toast } from "react-toastify";

const Login = () => {
  const loginValidationSchema = yup
    .object()
    .shape({
      phoneNumber: yup
        .string()
        .nullable()
        .notRequired()
        .matches(/^\d+$/, "Phone number is required")
        .transform((value, originalValue) =>
          originalValue.trim() === "" ? null : value
        ),
      email: yup
        .string()
        .nullable()
        .notRequired()
        .email("Invalid email format")
        .transform((value, originalValue) =>
          originalValue.trim() === "" ? null : value
        ),
    })
    .test(
      "at-least-one",
      "Either phone number or email is required",
      function (value) {
        return !!(value.phoneNumber || value.email);
      }
    );
  const otpValidationSchema = yup.object().shape({
    otp: yup
      .string()
      .required("OTP is required")
      .length(6, "OTP must be 6 digits")
      .matches(/^\d{6}$/, "OTP must be numeric"),
  });
  const profileValidationSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    agreed: yup
      .bool()
      .oneOf([true], "You must agree to our terms and conditions"),
  });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPhoneData, setUserPhoneData] = useState({
    phoneSuffix: null,
    phoneNumber: null,
    email: null,
  });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedCountry, setselectedCountry] = useState(countries[0]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const { theme } = useThemeStore();
  const [showDrowpDown, setShowDropDown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    setLoading(true);
    try {
      if (email) {
        const response = await sendOtp(null, null, email);
        console.log(response);
        if (response.status === "success") {
          setUserPhoneData({ email });
          setStep(2);
          toast.info("OTP sent to  Email");
        }
      } else {
        const response = await sendOtp(
          selectedCountry.dialCode,
          phoneNumber,
          null
        );
        console.log(response);
        let phoneSuffix = selectedCountry.dialCode;
        if (response.status === "success") {
          setUserPhoneData({ phoneSuffix, phoneNumber });
          setStep(2);
          toast.info("OTP sent to Phone Number");
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async () => {
    try {
      setLoading(true);
      if (!userPhoneData) {
        throw new Error("Phone or email data is missing");
      }
      let otpString = otp.join("");
      let response;
      if (userPhoneData?.email) {
        response = await verifyOtp(null, null, otpString, userPhoneData.email);
      } else {
        response = await verifyOtp(
          userPhoneData.phoneSuffix,
          userPhoneData.phoneNumber,
          otpString,
          null
        );
      }
      console.log(response);
      if (response.status === "success") {
        const token = response.data?.token;
        localStorage.setItem("auth_token", token);
        toast.success("OTP verified succesfully");
        const newUser = response.data?.user;
        if (newUser?.username && newUser?.profilePicture) {
          setCurrentUser(newUser);
          // navigate("/");
          toast.success("Welcome back to Chatify");
          console.log("This is new User ", newUser);
          resetLoginStore();
        } else {
          setStep(3);
        }
      } else {
        toast.error("Wrong Otp");
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Falied to Verify OTP");
    } finally {
      setLoading(false);
    }
  };
  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);
      if (profilePictureFile) {
        formData.append("media", profilePictureFile);
      } else {
        formData.append("profilePicture", selectedAvatar);
      }
      const response = await updateProfile(formData);
      setCurrentUser(response.data.user);
      navigate("/");
      toast.success("Welcome to Chatify");
      resetLoginStore();
    } catch (error) {
      setError(error.message || "Failed to Update User Profile");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleBack = () => {
    setStep(1);
    setUserPhoneData(null);
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  const {
    register: loginRegister,
    handleSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: yupResolver(loginValidationSchema) });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({ resolver: yupResolver(otpValidationSchema) });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({ resolver: yupResolver(profileValidationSchema) });

  const { step, setStep, resetLoginStore } = useLoginStore();

  const filteredCountries = countries.filter((country) => {
    //Filters country that contains searchTerm
    return country.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOtpInput = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpValue("otp", newOtp.join(""));
    //  if(otp.join("").length > 5)
    //   document.getElementById('verify-btn').disabled = false;
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  // const ProgressBar = () => {
  //   return (
  //     <div
  //       className={` w-[80%] h-4 ${theme === "light" ? "bg-pink-100" : "bg-gray-600"
  //         } rounded-full`}
  //     >
  //       <motion.div
  //         initial={{ width: "0%" }}
  //         animate={{
  //           width: `${(step / 3) * 100}%`,
  //           transition: { duration: 0.2, easeInOut },
  //         }}
  //         className={`h-full w-full ${theme === "light" ? "bg-pink-600" : "bg-gray-900"
  //           } rounded-full`}
  //       ></motion.div>
  //     </div>
  //   );
  // };

// ── Inline Spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 mx-auto text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

// ── Progress Bar ────────────────────────────────────────────────────────────
const ProgressBar = ({ step }) => (
  <div className="flex gap-2 items-center justify-center">
    {[1, 2, 3].map((s) => (
      <div
        key={s}
        className={`h-[5px] w-7 rounded-full transition-all duration-300 ${
          s <= step ? "bg-[#C2185B]" : "bg-[#F48FB1]"
        }`}
      />
    ))}
  </div>
);

  return (
    <div
      className={`min-h-screen min-w-screen flex justify-center items-center ${
        theme === "light" ? "bg-[#FCE4EC]" : "bg-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.6, delay: 0.3, ease: easeInOut },
        }}
        className={`rounded-2xl shadow-lg shadow-pink-200 ${
          theme === "light" ? "bg-white border border-[#F8BBD0]" : "bg-gray-800"
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 100,
              duration: 0.8,
            },
          }}
          className="flex flex-col justify-center items-center space-y-4 mx-10 my-8 w-72"
        >
          {/* Icon */}
          <div className="w-16 h-16 bg-[#F48FB1] rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#880E4F]">
              Login to Chatify
            </h1>
            <p className="text-sm text-[#AD1457] mt-1">Your cozy chat corner</p>
          </div>

          {/* Progress */}
          <ProgressBar step={step} />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg w-full text-center">
              {error}
            </p>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form
              className="w-full space-y-4"
              onSubmit={handleSubmit(handleLoginSubmit)}
            >
              <p className="text-sm font-medium text-[#AD1457]">
                Enter your email to log in
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F48FB1]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  {...loginRegister("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF0F5] border border-[#F8BBD0] rounded-xl text-sm text-[#4A1528] placeholder-[#F48FB1] focus:outline-none focus:border-[#C2185B] focus:bg-white transition"
                />
              </div>
              {loginErrors.email && (
                <p className="text-xs text-red-500">{loginErrors.email.message}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white font-medium py-2.5 rounded-xl transition"
              >
                {loading ? <Spinner /> : "Send OTP"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form
              className="w-full flex flex-col items-center gap-3 px-2"
              onSubmit={handleOtpSubmit(onOtpSubmit)}
            >
              <p className="text-sm font-medium text-[#AD1457] text-center">
                Enter the 6-digit OTP sent to your email
              </p>

              <div className="flex gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, index)}
                    className="w-12 h-14 border-2 border-[#F8BBD0] rounded-xl bg-[#FFF0F5] text-center text-xl font-semibold text-[#880E4F] outline-none focus:border-[#C2185B] focus:bg-white focus:ring-2 focus:ring-[#C2185B]/20 transition-all"
                  />
                ))}
              </div>

              {otpErrors.otp && (
                <p className="text-xs text-red-500">{otpErrors.otp.message}</p>
              )}

              <p className="text-xs text-[#AD1457]">
                Didn't receive it?{" "}
                <span className="font-semibold cursor-pointer underline">Resend OTP</span>
              </p>

              <button
                type="submit"
                className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white font-medium py-2.5 rounded-xl transition"
              >
                {loading ? <Spinner /> : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full flex items-center justify-center gap-2 border border-[#F8BBD0] text-[#C2185B] hover:bg-[#FFF0F5] font-medium py-2.5 rounded-xl transition"
              >
                <FaArrowLeft className="text-xs" />
                Go back
              </button>
            </form>
          )}

          {/* ── Step 3: Profile ── */}
          {step === 3 && (
            <form
              className="w-full flex flex-col items-center gap-3"
              onSubmit={handleProfileSubmit(onProfileSubmit)}
            >
              {/* Profile picture */}
              <div className="relative w-20 h-20 rounded-full border-[3px] border-[#C2185B]">
                <img
                  src={profilePicture || selectedAvatar}
                  alt="profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-[#C2185B] hover:bg-[#AD1457] text-white rounded-full p-1 cursor-pointer"
                >
                  <FaPlus className="text-xs" />
                </label>
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>

              {/* Avatar picker */}
              <p className="text-xs text-[#AD1457] font-medium">Choose an avatar</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`avatar-${index}`}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`h-10 w-10 rounded-full cursor-pointer p-0.5 border-2 transition ${
                      selectedAvatar === avatar
                        ? "border-[#C2185B]"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Username */}
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F48FB1]">
                  <FaUser className="text-sm" />
                </span>
                <input
                  type="text"
                  {...profileRegister("username")}
                  placeholder="Username"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFF0F5] border border-[#F8BBD0] rounded-xl text-sm text-[#4A1528] placeholder-[#F48FB1] focus:outline-none focus:border-[#C2185B] focus:bg-white transition"
                />
              </div>
              {profileErrors.username && (
                <p className="text-xs text-red-500">{profileErrors.username.message}</p>
              )}

              {/* Terms */}
              <div className="flex items-center gap-2 w-full">
                <input
                  type="checkbox"
                  id="agreed"
                  {...profileRegister("agreed")}
                  className="accent-[#C2185B] w-4 h-4"
                />
                <label htmlFor="agreed" className="text-xs text-[#4A1528]">
                  I agree to the{" "}
                  <a href="/terms-and-conditions" className="text-[#C2185B] underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
              {profileErrors.agreed && (
                <p className="text-xs text-red-500">{profileErrors.agreed.message}</p>
              )}

              <button
                type="submit"
                disabled={!watch("agreed") || loading}
                className="w-full bg-[#C2185B] hover:bg-[#AD1457] disabled:bg-[#F8BBD0] text-white font-medium py-2.5 rounded-xl transition"
              >
                {loading ? <Spinner /> : "Create Profile"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;