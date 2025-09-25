"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Play, Pause } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

export default function FitnessAppStreaming() {
  const [isLive, setIsLive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    if (isLive) {
      startCamera();
      loadModel();
    } else {
      stopCamera();
    }
  }, [isLive]);

  async function loadModel() {
    detectorRef.current = await posedetection.createDetector(
      posedetection.SupportedModels.MoveNet,
      { modelType: "lite" }
    );
    detectPose();
  }

  async function startCamera() {
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }

  async function detectPose() {
    if (!detectorRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    async function frame() {
      if (videoRef.current && detectorRef.current) {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (poses.length > 0) {
          drawKeypoints(poses[0].keypoints, ctx);
          await giveFeedback(poses[0].keypoints);
        }
      }
      requestAnimationFrame(frame);
    }
    frame();
  }

  function drawKeypoints(keypoints, ctx) {
    keypoints.forEach((kp) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff0066";
        ctx.fill();
      }
    });
  }

  async function giveFeedback(keypoints) {
    const leftShoulder = keypoints.find((k) => k.name === "left_shoulder");
    const rightShoulder = keypoints.find((k) => k.name === "right_shoulder");

    let message = "";
    if (leftShoulder && rightShoulder) {
      const diff = Math.abs(leftShoulder.y - rightShoulder.y);
      message = diff > 40 ? "⚠️ Keep shoulders level" : "✅ Great posture!";
      setFeedback(message);

      try {
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "mom123", feedback: message }),
        });
      } catch (err) {
        console.error("Failed to save feedback", err);
      }
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center p-2 sm:p-4">
      <header className="w-full flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-pink-600">MomFit Live</h1>
        <Button variant="outline" size="sm">Profile</Button>
      </header>

      <Card className="w-full max-w-md aspect-video relative shadow-lg overflow-hidden rounded-2xl">
        <CardContent className="p-0 w-full h-full">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          {isLive && feedback && (
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-xl p-2 text-xs sm:text-sm text-gray-800 shadow-md">
              {feedback}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-3 w-full max-w-md">
        <Button onClick={() => setIsLive(true)} className="bg-pink-500 hover:bg-pink-600 flex-1">
          <Play className="mr-1 h-4 w-4" /> Start
        </Button>
        <Button onClick={() => setIsLive(false)} variant="destructive" className="flex-1">
          <Pause className="mr-1 h-4 w-4" /> Stop
        </Button>
      </div>

      <footer className="mt-6 text-gray-600 text-xs text-center">
        "Strong Moms, Strong Families 💪"
      </footer>
    </div>
  );
}