import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, Tooltip, XAxis } from "recharts";
import Loader from "../Loader";
import Message from "../Message";

const AnswerStatisticsTab = ({ formID }) => {
  const [errors, setErrors] = useState(new Set());

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({});

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `/api/forms/${formID}/answers/statistics`,
        config
      );
      setData(data);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : errors.size > 0 ? (
        [...errors].map((error, index) => (
          <Message key={index} variant="danger">
            {error}
          </Message>
        ))
      ) : (
        <div className="d-flex flex-column align-items-center">
          <p>Statistici formular</p>
          <BarChart
            width={300}
            height={400}
            data={data.usersScore}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Bar dataKey="punctajUtilizator" fill="#8884d8" />
            <XAxis dataKey="punctajUtilizator" />
            <Tooltip content={<TooltipUserScore />} />
          </BarChart>
          <p>Cele mai bune scoruri</p>
          <BarChart
            width={300}
            height={400}
            data={data.bestQuestions}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Bar dataKey="scorTotal" fill="#8884d8" />
            <XAxis dataKey="scorTotal" />
            <Tooltip content={<TooltipQuestion />} />
          </BarChart>
          <p>Intrebarile cu cel mai bun punctaj</p>
          <BarChart
            width={300}
            height={400}
            data={data.badQuestions}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Bar dataKey="scorTotal" fill="#8884d8" />

            <XAxis dataKey="scorTotal" />
            <Tooltip content={<TooltipQuestion />} />
          </BarChart>
          <p>Intrebarile cu cel mai slab punctaj</p>
        </div>
      )}
    </>
  );
};

const TooltipUserScore = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const user = payload[0].payload.utilizator;
    return (
      <div className="custom-tooltip">
        <p className="label">{`Nume: ${user.nume} ${user.prenume}`}</p>
        <p className="intro">{`Scor: ${label}`}</p>
        <p className="desc">{`Email: ${user.email}`}</p>
      </div>
    );
  }

  return null;
};

const TooltipQuestion = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const question = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="label">{`${question.titlu}`}</p>
      </div>
    );
  }

  return null;
};

export default AnswerStatisticsTab;
