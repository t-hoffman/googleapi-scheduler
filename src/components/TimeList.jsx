import { PulseLoader } from "react-spinners";

export default function TimeList({ showTimes, setSelectedTime }) {
  return showTimes && showTimes.length > 0 ? (
    <ul className="show-times-grid w-100">
      {showTimes.map((time, idx) => (
        <li key={idx}>
          <button
            className="btn btn-primary w-100"
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <div className="p-3">
      <PulseLoader
        color="#fff"
        cssOverride={{ opacity: "20%" }}
        size={10}
        speedMultiplier={0.7}
      />
    </div>
  );
}
