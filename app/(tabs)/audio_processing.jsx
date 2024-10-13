import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';

import { icons } from "../../constants";
import { CustomButton } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const CreateAudio = () => {
  const { recordings, setRecordings } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    audio: null,
    audioName: "",
  });
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState("");
  const [isBuffering, setIsBuffering] = useState(false);
  const [showTranscriptionToggle, setShowTranscriptionToggle] = useState(true);
  const [showSummaryToggle, setShowSummaryToggle] = useState(true);
  const [showFlashcardsToggle, setShowFlashcardsToggle] = useState(true);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        setRecording(recording);
        setRecordingStatus("recording");
        setIsBuffering(true);
      } else {
        Alert.alert("Permission to access microphone is required!");
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      setRecordingStatus("idle");
    }
  };

  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setForm({ ...form, audio: { uri } });
        setRecording(null);
        setRecordingStatus("idle");
        setIsBuffering(false);
      } catch (err) {
        console.error("Failed to stop recording:", err);
        setRecordingStatus("idle");
      }
    }
  };

  const openPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });

      if (!result.canceled) {
        setForm({
          ...form,
          audio: result.assets[0],
        });
      }
    } catch (error) {
      console.error("Error picking document: ", error);
    }
  };

  const saveAudioLocally = async (transcription) => {
    try {
      const filename = `${form.audioName}.m4a`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.moveAsync({
        from: form.audio.uri,
        to: newPath,
      });

      const audioData = {
        name: form.audioName,
        uri: newPath,
        transcription,
      };

      const existingRecordings = [...recordings];
      existingRecordings.push(audioData);
      await AsyncStorage.setItem('recordings', JSON.stringify(existingRecordings));

      setRecordings(existingRecordings);

      return audioData;
    } catch (error) {
      console.error("Error saving audio locally", error);
      throw error;
    }
  };

  const transcribeAudio = async () => {
    if (!form.audio) {
      return Alert.alert("Please provide an audio file for transcription");
    }

    setIsBuffering(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: form.audio.uri,
        name: `${form.audioName}.m4a`,
        type: "audio/m4a",
      });

      const response = await fetch("https://5395-103-214-61-57.ngrok-free.app/transcribe/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTranscription(data.transcription);
        setSummary(""); 
        setFlashcards(""); 
      } else {
        Alert.alert("Error", "Failed to transcribe audio: " + data.detail);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      Alert.alert("Error", "Failed to transcribe audio: " + error.message);
    } finally {
      setIsBuffering(false);
    }
  };

  const summarizeTranscription = async (transcriptionText) => {
    if (!transcriptionText) {
      return Alert.alert("Transcription is empty", "Please transcribe audio first.");
    }

    try {
      setIsBuffering(true);

      const response = await fetch("https://5395-103-214-61-57.ngrok-free.app/summarize/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: transcriptionText,
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      } else {
        Alert.alert("Error", "Failed to summarize transcription: " + data.detail);
      }
    } catch (error) {
      console.error("Error summarizing transcription:", error);
      Alert.alert("Error", "Failed to summarize transcription: " + error.message);
    } finally {
      setIsBuffering(false);
    }
  };

  const generateFlashcards = async (transcriptionText) => {
    if (!transcriptionText) {
      return Alert.alert("Transcription is empty", "Please transcribe audio first.");
    }

    try {
      setIsBuffering(true);

      const response = await fetch("https://5395-103-214-61-57.ngrok-free.app/flashcards/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: transcriptionText,
      });

      const data = await response.json();

      if (response.ok) {
        setFlashcards(data.flashcards);
      } else {
        Alert.alert("Error", "Failed to generate flashcards: " + data.detail);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      Alert.alert("Error", "Failed to generate flashcards: " + error.message);
    } finally {
      setIsBuffering(false);
    }
  };

  const submit = async () => {
    if (!form.audio || !form.audioName) {
      return Alert.alert("Please provide an audio file and a name for it");
    }

    setUploading(true);
    try {
      const savedAudio = await saveAudioLocally(transcription);
      Alert.alert("Success", "Audio saved locally with the name: " + savedAudio.name);
    } catch (error) {
      Alert.alert("Error", "Failed to save audio locally: " + error.message);
    } finally {
      setForm({
        audio: null,
        audioName: "",
      });
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      Clipboard.setString(text);
      Alert.alert("Copied to Clipboard", "Text has been copied to clipboard.");
    } else {
      Alert.alert("Nothing to copy", "No text available for copying.");
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-gray-100 font-bold">Audio Transcription</Text>
        
        <View className="mt-6 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Audio Name</Text>
          <TextInput
            value={form.audioName}
            onChangeText={(text) => setForm({ ...form, audioName: text })}
            className="h-12 px-4 border border-gray-300 rounded-2xl text-gray-100"
            placeholder="Enter audio name"
          />
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Audio File</Text>
          {recordingStatus === "recording" ? (
            <View className="flex flex-row justify-between">
              <CustomButton
                title="Stop Recording"
                handlePress={stopRecording}
                className="mt-2 w-1/2 bg-red-600 text-gray-100"
              />
            </View>
          ) : (
            <View className="flex flex-row justify-between">
              <CustomButton
                title="Start Recording"
                handlePress={startRecording}
                className="mt-2 w-1/2 bg-green-600 text-gray-100"
              />
              <CustomButton
                title="Upload Audio"
                handlePress={openPicker}
                className="mt-2 w-1/2 bg-blue-600 text-gray-100"
              />
            </View>
          )}
        </View>

        {form.audio && (
          <View className="mt-6">
            <Text className="text-base text-gray-100 font-pmedium">Selected Audio:</Text>
            <Text className="text-base text-gray-300">{form.audio.uri.split("/").pop()}</Text>
          </View>
        )}

        {isBuffering && <ActivityIndicator size="large" color="green" className="mt-6" />}

        {/* Buttons for Transcribe, Summarize, and Flashcards */}
        <View className="flex flex-row justify-between mt-6">
          <CustomButton
            title="Transcribe"
            handlePress={transcribeAudio}
            className="w-1/3 bg-orange-600 text-gray-100"
          />
          <CustomButton
            title="Summarize"
            handlePress={() => summarizeTranscription(transcription)}
            className="w-1/3 bg-yellow-600 text-gray-100"
          />
          <CustomButton
            title="Flashcards"
            handlePress={() => generateFlashcards(transcription)}
            className="w-1/3 bg-purple-600 text-gray-100"
          />
        </View>

        {transcription && (
          <View className="mt-6">
            <TouchableOpacity onPress={() => setShowTranscriptionToggle(!showTranscriptionToggle)}>
              <Text className="text-base text-gray-100 font-pmedium">
                {showTranscriptionToggle ? "Hide Transcription" : "Show Transcription"}
              </Text>
            </TouchableOpacity>
            {showTranscriptionToggle && (
              <Text className="mt-2 text-gray-300">{transcription}</Text>
            )}
            <TouchableOpacity onPress={() => copyToClipboard(transcription)}>
              <Text className="mt-2 text-blue-400">Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {summary && (
          <View className="mt-6">
            <TouchableOpacity onPress={() => setShowSummaryToggle(!showSummaryToggle)}>
              <Text className="text-base text-gray-100 font-pmedium">
                {showSummaryToggle ? "Hide Summary" : "Show Summary"}
              </Text>
            </TouchableOpacity>
            {showSummaryToggle && (
              <Text className="mt-2 text-gray-300">{summary}</Text>
            )}
            <TouchableOpacity onPress={() => copyToClipboard(summary)}>
              <Text className="mt-2 text-blue-400">Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {flashcards && (
          <View className="mt-6">
            <TouchableOpacity onPress={() => setShowFlashcardsToggle(!showFlashcardsToggle)}>
              <Text className="text-base text-gray-100 font-pmedium">
                {showFlashcardsToggle ? "Hide Flashcards" : "Show Flashcards"}
              </Text>
            </TouchableOpacity>
            {showFlashcardsToggle && (
              <Text className="mt-2 text-gray-300">{flashcards}</Text>
            )}
          </View>
        )}

        <View className="mt-6">
          <CustomButton
            title="Save"
            handlePress={submit}
            className="bg-green-600 text-gray-100"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAudio;
