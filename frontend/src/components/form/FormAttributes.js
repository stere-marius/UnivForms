import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector, useDispatch } from "react-redux";
import { updateForm, listFormDetails } from "../../actions/formActions";
import ConfirmationModal from "../ConfirmationModal";
import Loader from "../Loader";
import axios from "axios";
import { withRouter } from "react-router-dom";

const FormAttributes = ({ form, history }) => {
  const dispatch = useDispatch();

  const formUpdate = useSelector(state => state.formUpdate);
  const { loading, success, error: errorUpdate } = formUpdate;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [acceptMultipleAnswers, setAcceptMultipleAnswers] = useState(
    Boolean(form.raspunsuriMultipleUtilizator)
  );

  const [formTitle, setFormTitle] = useState(form.titlu || "");

  const [errors, setErrors] = useState(new Set());

  const [time, setTime] = useState(form.timpTransmitere || 0);

  const [isTimerPanel, setTimerPanelVisible] = useState(
    Boolean(form.timpTransmitere)
  );

  const [isExpirePanel, setExpirePanelVisible] = useState(
    Boolean(form.dataExpirare)
  );

  const [isStartPanel, setStartPanelVisible] = useState(
    Boolean(form.dataValiditate)
  );

  const [isActiveModalDeleteForm, setActiveModalDeleteForm] = useState(false);

  const [textLinkCopy, setTextLinkCopy] = useState("Obtine link formular");

  const date = new Date();
  date.setDate(date.getDate() + 1);

  const [dateValid, setDateValid] = useState(
    (form.dataValiditate && new Date(form.dataValiditate)) || new Date()
  );
  const [expireDate, setDateExpire] = useState(
    (form.dataExpirare && new Date(form.dataExpirare)) || date
  );

  useEffect(() => {
    setErrors(new Set());
  }, [acceptMultipleAnswers, time, dateValid, expireDate]);

  const handleChangeTime = e => {
    const value = e.target.value;

    if (+value <= 0) {
      setErrors(new Set().add("Timpul nu poate fi negativ!"));
      return;
    }

    setTime(value);
  };

  const handleDelete = () => {
    setActiveModalDeleteForm(true);
  };

  const handleCopyLinkForm = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    navigator.clipboard.writeText(`${protocol + "//" + host}/form/${form._id}`);
    setTextLinkCopy("Link copiat cu succes");
    setTimeout(() => {
      setTextLinkCopy("Obtine link formular");
    }, 3000);
  };

  const handleConfirmDeleteForm = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(`/api/forms/${form._id}`, config);
      history.push("/");
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    }
  };

  const handleSave = async () => {
    if (!formTitle) {
      setErrors(
        new Set(errors).add("Titlul formularului nu trebuie să fie vid!")
      );
      return;
    }

    if (isStartPanel && !(dateValid instanceof Date && !isNaN(dateValid))) {
      errors.add(new Set(errors).add("Format invalid data validitate!"));
      return;
    }

    if (isExpirePanel && !(expireDate instanceof Date && !isNaN(expireDate))) {
      errors.add(new Set(errors).add("Format invalid data expirare!"));
      return;
    }

    await dispatch(
      updateForm(form._id, {
        titlu: formTitle,
        raspunsuriMultipleUtilizator: acceptMultipleAnswers,
        dataValiditate: isStartPanel && dateValid ? dateValid : undefined,
        dataExpirare: isExpirePanel && expireDate ? expireDate : undefined,
        timpTransmitere: isTimerPanel && time ? time : undefined,
      })
    );
    dispatch(listFormDetails(form._id));
  };

  return (
    <div className="p-4">
      <div className="row mb-3">
        <div className="col-auto">
          <label htmlFor="formTitle" className="fs-5">
            Titlul formularului
          </label>
          <input
            type="text"
            className="form-control form-input-green"
            id="formTitle"
            placeholder="Titlul formularului"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-auto fs-4">
          <input
            type="checkbox"
            className="form-check-input form-input-green"
            id="checkMultipleAnswers"
            style={{ marginRight: "7px" }}
            checked={acceptMultipleAnswers}
            onChange={() => setAcceptMultipleAnswers(!acceptMultipleAnswers)}
          />
          <label for="checkMultipleAnswers">
            Formularul accepta raspunsuri multiple de la acelasi utilizator
          </label>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-auto fs-4">
          <input
            type="checkbox"
            className="form-check-input form-input-green"
            id="checkTimer"
            style={{ marginRight: "7px" }}
            checked={isTimerPanel}
            onChange={() => setTimerPanelVisible(!isTimerPanel)}
          />
          <label for="checkTimer">
            Formularul are un timp limitat de trimis rezultatele
          </label>
        </div>
      </div>

      {isTimerPanel && (
        <div className="row mt-3">
          <label htmlFor="formTime" className="fs-5">
            Timp in secunde
          </label>
          <div className="col-auto">
            <input
              type="number"
              className="form-input-green"
              id="formTime"
              value={time}
              onChange={handleChangeTime}
            />
          </div>
        </div>
      )}

      <div className="row mt-3">
        <div className="col-auto fs-4">
          <input
            type="checkbox"
            className="form-check-input form-input-green"
            id="checkDateValid"
            style={{ marginRight: "7px" }}
            checked={isStartPanel}
            onChange={() => setStartPanelVisible(!isStartPanel)}
          />
          <label for="checkDateValid">
            Formularul incepe sa fie valid de la o anumita data
          </label>
        </div>
      </div>

      {isStartPanel && (
        <div className="row mt-3">
          <div className="col-auto">
            <label htmlFor="formDateValid" className="fs-5">
              Data validitate
            </label>
            <DatePicker
              selected={dateValid}
              dateFormat="dd/MM/yyyy"
              onChange={date => setDateValid(date)}
              showTimeInput
            />
          </div>
        </div>
      )}

      <div className="row mt-3">
        <div className="col-auto fs-4">
          <input
            type="checkbox"
            className="form-check-input form-input-green"
            id="checkDateExpire"
            style={{ marginRight: "7px" }}
            checked={isExpirePanel}
            onChange={() => setExpirePanelVisible(!isExpirePanel)}
          />
          <label for="checkDateExpire">
            Formularul expira la o anumita data
          </label>
        </div>
      </div>

      {isExpirePanel && (
        <div className="row mt-3">
          <div className="col-auto">
            <label htmlFor="formDateValid" className="fs-5">
              Data expirare
            </label>
            <DatePicker
              selected={expireDate}
              dateFormat="dd/MM/yyyy"
              onChange={date => setDateExpire(date)}
              showTimeInput
            />
          </div>
        </div>
      )}
      {errors.size > 0 &&
        [...errors].map((error, index) => (
          <div key={index} className="alert alert-danger mt-3">
            {error}
          </div>
        ))}

      {loading && <Loader />}
      {success && (
        <div className="alert alert-success mt-3">
          Formularul a fost actulizat cu success!
        </div>
      )}

      {errorUpdate && (
        <div className="alert alert-danger mt-3"> {errorUpdate} </div>
      )}

      <div className="d-flex flex-column align-items-start">
        <button
          className="btn btn-color-green px-3 mt-5 fw-bold"
          onClick={handleCopyLinkForm}
        >
          {textLinkCopy}
        </button>

        <button
          className="btn btn-color-green px-3 mt-5 fw-bold"
          onClick={handleSave}
        >
          Salveaza
        </button>

        <button
          className="btn btn-danger px-3 mt-5 fw-bold text-dark"
          onClick={handleDelete}
        >
          Sterge formular
        </button>

        <ConfirmationModal
          showModal={isActiveModalDeleteForm}
          body={
            <>
              <p>Confirmati stergerea</p>
            </>
          }
          title={"Stergeti formularul?"}
          textConfirm={"Da"}
          textClose={"Nu"}
          onConfirm={handleConfirmDeleteForm}
          onClose={() => setActiveModalDeleteForm(false)}
        />
      </div>
    </div>
  );
};

export default withRouter(FormAttributes);
