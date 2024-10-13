import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { useGlobalContext } from "../../context/GlobalProvider";
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const ListRecordings = () => {
  const { recordings, setRecordings } = useGlobalContext();
  const [playingUri, setPlayingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [expandedRecordingIndex, setExpandedRecordingIndex] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecordingIndex, setSelectedRecordingIndex] = useState(null);

  useEffect(() => {
    const loadRecordings = async () => {
      try {
        const recordingsData = await AsyncStorage.getItem('recordings');
        if (recordingsData) {
          setRecordings(JSON.parse(recordingsData));
        }
      } catch (error) {
        console.error("Failed to load recordings from storage:", error);
      }
    };
    loadRecordings();
  }, []);

  useEffect(() => {
    if (sound) {
      const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis);
          setPlaybackDuration(status.durationMillis);
          if (status.didJustFinish) {
            setPlayingUri(null); // Reset when finished
            setSound(null); // Cleanup
          }
        }
      };
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      return () => sound.setOnPlaybackStatusUpdate(null);
    }
  }, [sound]);

  const playPauseAudio = async (uri) => {
    if (sound && playingUri === uri) {
      await sound.pauseAsync();
      setPlayingUri(null);
    } else {
      if (sound) {
        await sound.stopAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingUri(uri);
      await newSound.playAsync();
    }
  };

  const deleteRecording = async (index) => {
    try {
      const updatedRecordings = recordings.filter((_, i) => i !== index);
      setRecordings(updatedRecordings);
      await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error("Failed to delete recording:", error);
    }
  };

  const openMenu = (index) => {
    setSelectedRecordingIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = () => {
    deleteRecording(selectedRecordingIndex);
    setIsModalVisible(false);
  };

  const handleAddToGroup = () => {
    // Implement add to group functionality
    setIsModalVisible(false);
  };

  const toggleTranscript = (index) => {
    setExpandedRecordingIndex(expandedRecordingIndex === index ? null : index);
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Saved Recordings</Text>
        {recordings.map((recording, index) => (
          <View key={index} style={styles.recordingContainer}>
            <TouchableOpacity onPress={() => toggleTranscript(index)} style={styles.recordingInfo}>
              <Image
                source={require('../../assets/default_thumbnail.png')} // Default thumbnail
                style={styles.thumbnail}
              />
              <View style={styles.textContainer}>
                <Text style={styles.recordingName}>{recording.name}</Text>
                <Text style={styles.artistName}>Unknown Artist</Text>
              </View>
              <TouchableOpacity onPress={() => playPauseAudio(recording.uri)}>
                <AntDesign
                  name={playingUri === recording.uri ? "pausecircleo" : "playcircleo"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => openMenu(index)}>
                <MaterialIcons name="more-vert" size={24} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
            {playingUri === recording.uri && playbackDuration > 0 && (
              <View>
                <Slider
                  style={styles.slider}
                  value={playbackPosition}
                  minimumValue={0}
                  maximumValue={playbackDuration}
                  onValueChange={async (value) => {
                    await sound.setPositionAsync(value);
                    setPlaybackPosition(value);
                  }}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                />
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    {formatTime(playbackPosition)}
                  </Text>
                  <Text style={styles.timerText}>
                    / {formatTime(playbackDuration)}
                  </Text>
                </View>
              </View>
            )}
            {expandedRecordingIndex === index && (
              <Text style={styles.transcription}>{recording.transcription}</Text>
            )}
          </View>
        ))}
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Options</Text>
            <Button title="Add to Group" onPress={handleAddToGroup} />
            <Button title="Delete" onPress={handleDelete} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 30, // Lower the title further down
  },
  recordingContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    flexDirection: 'column',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recordingName: {
    fontSize: 18,
    color: 'white',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerText: {
    color: 'white',
    fontSize: 12,
  },
  menuButton: {
    padding: 8,
  },
  transcription: {
    marginTop: 10,
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ListRecordings;
