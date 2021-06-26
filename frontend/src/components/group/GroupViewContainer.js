import React, { useRef } from "react";
import { Link, withRouter } from "react-router-dom";
import { getDifferenceInDays } from "../../utilities";

const GroupViewContainer = ({ group }) => {
  const daysDifference = useRef(
    getDifferenceInDays(group.createdAt, new Date())
  );

  return (
    <div className="grup">
      <div className="grup__header--heading">
        <p className="__heading">{group.nume}</p>
        <p className="created__at">
          {daysDifference.current === 0
            ? "creat astazi"
            : `creat acum ${daysDifference.current} zile`}
        </p>
      </div>
      <div className="grup__body">
        <div className="body__attribute cursor-pointer">
          <div className="attribute__left">
            <p className="__tag">Utilizatori</p>
            <p className="__attribute--value">{group.utilizatori.length}</p>
          </div>
          <div className="attribute__right">
            <i className="fas fa-users" />
          </div>
        </div>
        <div className="body__attribute">
          <div className="attribute__left">
            <p className="__tag">Formulare</p>
            <p className="__attribute--value">{group.formulare.length}</p>
          </div>

          <div className="attribute__right">
            <i className="fas fa-file-invoice" />
          </div>
        </div>
      </div>
      <div className="grup__footer">
        <Link to={`/group/${group._id}`}>
          <button className="vezi__grup__btn">Vezi grup</button>
        </Link>
      </div>
    </div>
  );
};

export default withRouter(GroupViewContainer);
