import "./App.css";
import { Component } from "react";
import data from "./data.json";
import deleteIcon from "./images/icon-delete.svg";
import editIcon from "./images/icon-edit.svg";
import replyIcon from "./images/icon-reply.svg";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendText: "",
      data: data,
      delete: [-1, -1],
    };
    this.handleChange = this.handleChange.bind(this);
    this.send = this.send.bind(this);
    this.setDelete = this.setDelete.bind(this);
    this.yesDelete = this.yesDelete.bind(this);
    this.setScore = this.setScore.bind(this);
    this.handleCommentEdit = this.handleCommentEdit.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
  }
  componentDidMount() {
    this.adjustTextareaHeights();
  }

  componentDidUpdate() {
    this.adjustTextareaHeights();
  }

  adjustTextareaHeights = () => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  };

  toggleEditing(a, b) {
    const nuevaData = { ...this.state.data };
    if (b === -1) {
      if (nuevaData.comments[a].hasOwnProperty("editing")) {
        delete nuevaData.comments[a].editing;
      } else {
        nuevaData.comments[a].editing = true;
      }
    } else {
      if (nuevaData.comments[a].replies[b].hasOwnProperty("editing")) {
        const regex1 = RegExp(
          "^@" + nuevaData.comments[a].replies[b].replyingTo + " "
        );
        delete nuevaData.comments[a].replies[b].editing;
        nuevaData.comments[a].replies[b].content = nuevaData.comments[
          a
        ].replies[b].content.replace(regex1, "");
      } else {
        nuevaData.comments[a].replies[b].content =
          "@" +
          nuevaData.comments[a].replies[b].replyingTo +
          " " +
          nuevaData.comments[a].replies[b].content;
        nuevaData.comments[a].replies[b].editing = true;
      }
    }
    this.setState({ data: nuevaData });
  }
  handleCommentEdit = (event, a, b) => {
    this.adjustTextareaHeights();
    const nuevaData = { ...this.state.data };
    if (b === -1) {
      nuevaData.comments[a].content = event.target.value;
    } else {
      if (
        event.target.value.startsWith("@"+
          nuevaData.comments[a].replies[b].replyingTo + " "
        )
      ) {
        nuevaData.comments[a].replies[b].content = event.target.value;
      }
    }
    this.setState({ data: nuevaData });
  };
  handleChange(event) {
    this.adjustTextareaHeights();

    this.setState({ sendText: event.target.value });
  }
  setScore(a, b, score) {
    const nuevaData = { ...this.state.data };
    if (b === -1) {
      if (
        nuevaData.comments[a].hasOwnProperty("myScore") &&
        score === nuevaData.comments[a].myScore
      ) {
        delete nuevaData.comments[a].myScore;
      } else {
        nuevaData.comments[a].myScore = score;
      }
    } else {
      if (
        nuevaData.comments[a].replies[b].hasOwnProperty("myScore") &&
        score === nuevaData.comments[a].replies[b].myScore
      ) {
        delete nuevaData.comments[a].replies[b].myScore;
      } else {
        nuevaData.comments[a].replies[b].myScore = score;
      }
    }

    this.setState({ data: nuevaData });
  }
  yesDelete() {
    let nuevoEstado = 0;
    let restComments, nuevoComment;
    if (this.state.delete[1] === -1) {
      nuevoEstado = {
        ...this.state.data,
        comments: this.state.data.comments.filter(
          (item, index) => index !== this.state.delete[0]
        ),
      };
    } else {
      restComments = this.state.data.comments.filter(
        (item, index) => index !== this.state.delete[0]
      );
      nuevoComment = {
        ...this.state.data.comments[this.state.delete[0]],
        replies: this.state.data.comments[this.state.delete[0]].replies.filter(
          (item, index) => index !== this.state.delete[1]
        ),
      };

      nuevoEstado = {
        ...this.state.data,
        comments: [...restComments, nuevoComment],
      };
    }

    // Actualizar el estado con la nueva copia que no contiene el elemento a eliminar.
    this.setState({
      data: nuevoEstado,
      delete: [-1, -1],
    });
  }
  setDelete(a, b) {
    this.setState({ delete: [a, b] });
  }
  send() {
    if (this.state.sendText !== "") {
      const nuevoElemento = {
        content: this.state.sendText,
        createdAt: "Now",
        score: 0,
        user: {
          username: this.state.data.currentUser.username,
          image: { png: this.state.data.currentUser.image.png },
        },
        replies: [],
      };

      const nuevoEstado = {
        ...this.state.data,
        comments: [...this.state.data.comments, nuevoElemento],
      };
      this.setState({
        data: nuevoEstado,
        sendText: "",
      });
    }
  }
  render() {
    return (
      <main>
        <div
          className={
            this.state.delete[0] !== -1 ? "deleteMenu" : "deleteMenu none"
          }
        >
          <div className="overlay"></div>
          <div className="deleteBox">
            <h1>Delete comment</h1>
            <p>
              Are you sure you want to delete this comment? this will remove the
              comment and can't be undone.
            </p>
            <div className="buttonsBox">
              <button onClick={() => this.setDelete(-1, -1)} className="no">
                NO, CANCEL
              </button>
              <button onClick={() => this.yesDelete()} className="yes">
                YES, DELETE
              </button>
            </div>
          </div>
        </div>
        {this.state.data.comments.map((element, index) => (
          <div className="block" key={index}>
            <div className="commentsBlock">
              <div className="likesBlock">
                <div
                  className={
                    element.hasOwnProperty("myScore") && element.myScore === 1
                      ? "icon setted"
                      : "icon"
                  }
                  onClick={() => this.setScore(index, -1, 1)}
                >
                  <svg
                    width="11"
                    height="11"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
                      fill="#C5C6EF"
                    />
                  </svg>
                </div>
                <p className="likeText">
                  {!element.hasOwnProperty("myScore")
                    ? element.score
                    : element.score + element.myScore}
                </p>
                <div
                  className={
                    element.hasOwnProperty("myScore") && element.myScore === -1
                      ? "icon setted"
                      : "icon"
                  }
                  onClick={() => this.setScore(index, -1, -1)}
                >
                  <svg width="11" height="3" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
                      fill="#C5C6EF"
                    />
                  </svg>
                </div>
              </div>
              <div className="rightBlock">
                <div className="block1">
                  <div className="leftBlock2">
                    <img
                      alt="avatar"
                      src={require("" + element.user.image.png)}
                    ></img>
                    <p className="name">{element.user.username}</p>
                    {element.user.username ===
                    this.state.data.currentUser.username ? (
                      <div className="youLabel">you</div>
                    ) : null}

                    <p className="time">{element.createdAt}</p>
                  </div>
                  {element.user.username ===
                  this.state.data.currentUser.username ? (
                    <div className="rightBlock2">
                      <div
                        onClick={() => this.setDelete(index, -1)}
                        className="commentBtn"
                      >
                        <img alt="Delete Icon" src={deleteIcon}></img>
                        <p className="red">Delete</p>
                      </div>
                      <div
                        onClick={() => this.toggleEditing(index, -1)}
                        className="commentBtn"
                      >
                        <img alt="Edit Icon" src={editIcon}></img>
                        <p>Edit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rightBlock2">
                      <div className="commentBtn">
                        <img alt="Reply Icon" src={replyIcon}></img>
                        <p>Reply</p>
                      </div>
                    </div>
                  )}
                </div>
                {element.hasOwnProperty("editing") ? (
                  <>
                    <textarea
                      onChange={(event) =>
                        this.handleCommentEdit(event, index, -1)
                      }
                      value={this.state.data.comments[index].content}
                      className="mainText editArea"
                    />
                    <div className="updateBox">
                      <button onClick={() => this.toggleEditing(index, -1)}>
                        UPDATE
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mainText">{element.content}</p>
                )}
              </div>
            </div>
            {element.replies.length > 0 ? (
              <div className="replies">
                <div className="lineReply"></div>
                <div className="repliesBlocks">
                  {element.replies.map((element, index2) => (
                    <div className="commentsBlock" key={index2}>
                      <div className="likesBlock">
                        <div
                          className={
                            element.hasOwnProperty("myScore") &&
                            element.myScore === 1
                              ? "icon setted"
                              : "icon"
                          }
                          onClick={() => this.setScore(index, index2, 1)}
                        >
                          <svg
                            width="11"
                            height="11"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
                              fill="#C5C6EF"
                            />
                          </svg>
                        </div>
                        <p className="likeText">
                          {!element.hasOwnProperty("myScore")
                            ? element.score
                            : element.score + element.myScore}
                        </p>
                        <div
                          className={
                            element.hasOwnProperty("myScore") &&
                            element.myScore === -1
                              ? "icon setted"
                              : "icon"
                          }
                          onClick={() => this.setScore(index, index2, -1)}
                        >
                          <svg
                            width="11"
                            height="3"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
                              fill="#C5C6EF"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="rightBlock">
                        <div className="block1">
                          <div className="leftBlock2">
                            <img
                              alt="avatar"
                              src={require("" + element.user.image.png)}
                            ></img>
                            <p className="name">{element.user.username}</p>
                            {element.user.username ===
                            this.state.data.currentUser.username ? (
                              <div className="youLabel">you</div>
                            ) : null}

                            <p className="time">{element.createdAt}</p>
                          </div>
                          {element.user.username ===
                          this.state.data.currentUser.username ? (
                            <div className="rightBlock2">
                              <div
                                onClick={() => this.setDelete(index, index2)}
                                className="commentBtn"
                              >
                                <img alt="Delete Icon" src={deleteIcon}></img>
                                <p className="red">Delete</p>
                              </div>
                              <div
                                onClick={() =>
                                  this.toggleEditing(index, index2)
                                }
                                className="commentBtn"
                              >
                                <img alt="Edit Icon" src={editIcon}></img>
                                <p>Edit</p>
                              </div>
                            </div>
                          ) : (
                            <div className="rightBlock2">
                              <div className="commentBtn">
                                <img alt="Reply Icon" src={replyIcon}></img>
                                <p>Reply</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {element.hasOwnProperty("editing") ? (
                          <>
                            <textarea
                              onChange={(event) =>
                                this.handleCommentEdit(event, index, index2)
                              }
                              value={
                                this.state.data.comments[index].replies[index2]
                                  .content
                              }
                              className="mainText editArea"
                            />
                            <div className="updateBox">
                              <button
                                onClick={() =>
                                  this.toggleEditing(index, index2)
                                }
                              >
                                UPDATE
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="mainText">
                            <span>@{element.replyingTo} </span>
                            {element.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <div className="commentsBlock chat">
          <img
            className="mainAvatar"
            alt="avatar"
            src={require("" + this.state.data.currentUser.image.png)}
          ></img>
          <textarea
            value={this.state.sendText}
            onChange={this.handleChange}
            placeholder="Add a comment..."
            className="textbox"
          />
          <button onClick={this.send} className="send">
            SEND
          </button>
        </div>
      </main>
    );
  }
}
export default App;
