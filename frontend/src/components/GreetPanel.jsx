const GreetPanel = () => {
  return (
    <div className="lg:flex flex-col h-screen items-center justify-between py-5 bg-primary w-[25%] hidden">
      <div className="flex flex-col gap-5">
        <img
          src="/images/logo_white_text.png"
          alt="RAFFI LOGO"
          className="h-16 w-16"
        />
        <h1 className="text-4xl font-bold text-white">
          Welcome!
          <br />
          to the CARES
          <br />
          Platform
        </h1>
        <p className="text-white text-sm">
          Providing seamless and efficient
          <br />
          care for cancer patients
        </p>
      </div>

      <img
        src="/images/patientdoc.png"
        alt="Patient Doc picture"
        className="w-[75%] h-"
      />
    </div>
  );
};

export default GreetPanel;
