import React, { Component } from 'react';
import styled from 'styled-components';

const VideoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const Video = styled.video`
  width: 50%;
`;

const Recordings = styled.div`
  width: 50%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  > video {
    width: 200px;
    height: 150px;
  }
`;

export default class extends Component {
  constructor() {
    super();
    this.state = {
      chunks: [],
      isRecording: false,
    };

    this.video = null;
  }
  
  componentDidMount() {
    if (!this.video) {
      throw new Error("Did not find video element");
    }
    
    if (!window.navigator.mediaDevices) {
      throw new Error("Your browser does not support media devices, try a new Chrome or Firefox"); 
    }
    
    window.navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    }).then((stream) => {
      this.video.src = window.URL.createObjectURL(stream);
      this.video.play();
      this.stream = stream;      
    }).catch((err) => {
      throw new Error(`Failed to start stream: ${err.message}`);
    });
  }

  startRecording() {
    const mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder = mediaRecorder;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.setState(({ chunks }) => {
          chunks.push(window.URL.createObjectURL(event.data));
          this.mediaRecorder = null;
          return {
            chunks, 
          }
        }); 
      }
    }
    this.mediaRecorder.start();
    
    this.setState(() => ({
      isRecording: true,
    }));
  }
  
  stopRecording() {
    if (!this.mediaRecorder) {
      return; 
    }

    this.mediaRecorder.stop();
    
    this.setState(() => ({
      isRecording: false,
    }));
  }
  
  render() {
    /* eslint-disable jsx-a11y/media-has-caption */
    return [
      <div key="a">
        {
          !this.state.isRecording ?
          <button onClick={() => this.startRecording()}>Start recording</button> :
          <button onClick={() => this.stopRecording()}>Stop recording</button>
        }
      </div>,
      <VideoWrapper key="b">
        <Video innerRef={video => { this.video = video }} />
        <Recordings key="c">
          {this.state.chunks.map(chunk => <video key={chunk} src={chunk} alt="" autoPlay loop/>)}
        </Recordings>
      </VideoWrapper>  
    ]
  }  
}