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
import { FaChevronDown, FaArrowLeft, FaPlus, FaUser } from "react-icons/fa";
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
        localStorage.setItem("auth_token" , token);
        toast.success("OTP verified succesfully");
        const newUser = response.data?.user;
        if (newUser?.username && newUser?.profilePicture) {
          setCurrentUser(newUser);
          // navigate("/");
          toast.success("Welcome back to Chatify");
          console.log("This is new User " , newUser);
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

  const {
    step,
    setStep,
    resetLoginStore,
  } = useLoginStore();

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

  const ProgressBar = () => {
    return (
      <div
        className={` w-[80%] h-4 ${
          theme === "light" ? "bg-pink-100" : "bg-gray-600"
        } rounded-full`}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{
            width: `${(step / 3) * 100}%`,
            transition: { duration: 0.2, easeInOut },
          }}
          className={`h-full w-full ${
            theme === "light" ? "bg-pink-600" : "bg-gray-900"
          } rounded-full`}
        ></motion.div>
      </div>
    );
  };

  return (
    <div
      className={` ${
        theme === "light" ? "bg-pink-200" : "bg-gray-800"
      } min-h-screen min-w-screen flex justify-center items-center text-black`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.6, delay: 0.3, ease: easeInOut },
        }}
        className={` rounded-md z-10 shadow-lg shadow-black ${
          theme === "light" ? "bg-pink-300" : "bg-gray-600"
        } text-white`}
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
          className="flex flex-col justify-center items-center space-y-6 mx-6"
        >
          <div className="mt-4 w-fit bg-black rounded-full flex items-center justify-center">
            <img
              src="icon.png "
              alt="icon"
              className="h-16 w-16 p-1 rounded-full"
            ></img>
          </div>
          <h1 className="text-3xl font-bold mx-8 text-center">
            Login to Chatify
          </h1>
          <ProgressBar />
          {error && <p>{error}</p>}
          {step === 1 && (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(handleLoginSubmit)}
            >
              <p>Enter your phone number to recieve an OTP</p>
              <div className="relative w-full">
                <div className="flex w-full gap-2">
                  <div className="relative w-fit">
                    <button
                      type="button"
                      className={`p-2 rounded-md z-4 bg-white text-black w-fit flex space-x-2 justify-center items-center`}
                      onClick={(e) => {
                        setShowDropDown(!showDrowpDown);
                        e.preventDefault();
                      }}
                    >
                      <span>
                        {selectedCountry.flag}({selectedCountry.dialCode})
                      </span>
                      <FaChevronDown />
                    </button>
                    {showDrowpDown && (
                      <div className="absolute max-h-40 max-w-24 overflow-y-auto overflow-x-hidden z-10 bg-white rounded-md">
                        <input
                          type="text"
                          className="sticky top-0 rounded-md my-1 px-2 focus:outline-none focus:ring-1 ring-pink-300 text-sm w-24 text-black h-6"
                          placeholder="Search Country"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                        />
                        <div className="flex gap-1 flex-col bg-white no-scrollbar">
                          {filteredCountries.map((country) => {
                            return (
                              <button
                                key={country.alpha2}
                                type="button"
                                className="bg-white text-black hover:bg-gray-300"
                                onClick={(e) => {
                                  setselectedCountry(country);
                                  setShowDropDown(!showDrowpDown);
                                }}
                              >
                                {country.flag}
                                {country.dialCode}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="phoneNumber w-2/3 h-[40px] text-black">
                    <input
                      className="h-[40px] w-full px-4 rounded-md"
                      type="text"
                      {...loginRegister("phoneNumber")}
                      value={phoneNumber}
                      placeholder="Phone Number"
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    />
                  </div>
                  {loginErrors.phoneNumber && (
                    <p>{loginErrors.phoneNumber.message}</p>
                  )}
                </div>
                <div className="divider my-6 flex gap-1 items-center justify-center w-full">
                  <div className="w-1/2 h-[2px] bg-white"></div>
                  <div>Or</div>
                  <div className="w-1/2 h-[2px] bg-white"></div>
                </div>
                <div className="email w-full text-black">
                  <input
                    className="h-[40px] px-4 rounded-md w-full"
                    type="email"
                    {...loginRegister("email")}
                    value={email}
                    placeholder="Email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </div>
                {loginErrors.email && <p>{loginErrors.email.message}</p>}
                <div className="flex justify-center items-center my-4 w-full">
                  <button className="p-2 bg-pink-500 rounded-lg " type="submit">
                    {loading ? <Spinner /> : "Send OTP"}
                  </button>
                </div>
              </div>
            </form>
          )}
          {step === 2 && (
            <form
              className="flex flex-col justify-center items-center"
              onSubmit={handleOtpSubmit(onOtpSubmit)}
            >
              <p className="text-md text-center">
                Enter the otp sent to{" "}
                {userPhoneData.phoneNumber
                  ? userPhoneData.phoneSuffix + userPhoneData.phoneNumber
                  : userPhoneData.email}
              </p>
              <div className="otp mb-4 flex gap-2">
                {otp.map((digit, index) => {
                  return (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpInput(e.target.value, index)}
                      className="h-14 w-14 text-2xl text-center rounded-md mt-4 focus:outline-none focus:ring-2 ring-pink-600 text-black flex justify-center items-center"
                    />
                  );
                })}
              </div>
              {otpErrors.otp && <p className="bg-red-500">{otpErrors.otp.message}</p>}
              <button
                type="submit"
                id="verify-btn"
                className="bg-pink-500 p-2 rounded-md hover:bg-pink-600 mb-3 disabled:bg-pink-200"
              >
                {loading ? <Spinner /> : " "} Verify OTP
              </button>
              <button
                type="button"
                className="bg-pink-500 p-2 rounded-md hover:bg-pink-600 mb-3 flex justify-center items-center gap-1"
                onClick={handleBack}
              >
                <FaArrowLeft />
                Go Back{" "}
              </button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="flex flex-col justify-center items-center gap-4">
                <div className="img relative h-24 w-24 rounded-full bg-white">
                  <img
                    src={profilePicture || selectedAvatar}
                    alt="profile-picture"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-pink-400 text-white hover:bg-pink-600 rounded-full p-1"
                  >
                    <FaPlus className="cursor-pointer" />
                  </label>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>
                <p>Choose an Avatar</p>
                <div className="avatars flex flex-wrap gap-1">
                  {avatars.map((avatar, index) => {
                    return (
                      <img
                        key={index}
                        src={avatar}
                        alt={`avatar-${index}`}
                        className={`h-12 w-12 rounded-full cursor-pointer p-0.5 ${
                          selectedAvatar === avatar
                            ? "ring-2 ring-pink-500"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedAvatar(avatar);
                        }}
                      />
                    );
                  })}
                </div>
                <div className="relative w-full">
                  <FaUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500  roudned-full h-4" />
                  <input
                    type="text"
                    {...profileRegister("username")}
                    placeholder="Username"
                    className=" w-full pl-10 pr-2 py-2 border rounded-lg focus:outline-pink-500 text-black"
                  />
                </div>
                {profileErrors.username && (
                  <p>{profileErrors.username.message}</p>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded focus:outline-pink-500 text-pink-400"
                    {...profileRegister("agreed")}
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      className="text-pink-700 underline"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                  {profileErrors.agreed && (
                    <p className="text-red-500">
                      {profileErrors.agreed.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  id="verify-btn"
                  disabled={!watch("agreed") || loading}
                  className=" w-full bg-pink-500 p-2 rounded-md hover:bg-pink-600 mb-3 disabled:bg-pink-200"
                >
                  {loading ? <Spinner /> : " "}Create Profile
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
