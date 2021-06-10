import React, { useRef } from "react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { getDifferenceInDays } from "../../utilities";
import { useSelector } from "react-redux";

const FormViewContainer = ({ form, history }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const daysDifference = useRef(
    getDifferenceInDays(form.createdAt, new Date())
  );

  return (
    <div className="formularele__tale">
      <div className="colectie__formulare">
        <div className="formular">
          <div className="formular__header--heading">
            <p className="__heading">{form.titlu}</p>
            <p className="created__at">
              {daysDifference.current === 0
                ? "creat astazi"
                : `creat acum ${daysDifference.current} zile`}
            </p>
          </div>
          <div className="formular__body">
            <div
              className="body__attribute cursor-pointer"
              onClick={() => history.push(`/form/${form._id}/answers`)}
            >
              <div className="attribute__left">
                <p className="__raspunsuri">Raspunsuri</p>
                <p className="__attribute--value">{form.raspunsuri}</p>
              </div>
              <div className="attribute__right">
                <i className="fas fa-copy" />
              </div>
            </div>
            <div className="body__attribute">
              <div className="attribute__left">
                <p className="__raspunsuri">Intrebari</p>
                <p className="__attribute--value">{form.intrebari}</p>
              </div>
              <Link
                to={`/form/${form._id}/edit`}
                className="text-decoration-none"
              >
                <div className="attribute__right">
                  <i className="fas fa-question" />
                </div>
              </Link>
            </div>
          </div>
          {form.utilizator === userInfo._id && (
            <div className="formular__footer">
              <Link to={`/form/${form._id}/edit`}>
                <button className="administreaza__btn">Administreaza</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(FormViewContainer);
