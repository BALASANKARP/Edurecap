import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

const ChatBotScreen = () => {
  const [paragraph, setParagraph] = useState(""); // Summary of the lecture
  const [question, setQuestion] = useState(""); // User's question
  const [messages, setMessages] = useState([]); // State to manage chat messages
  const [loading, setLoading] = useState(false);
  const [summaryProvided, setSummaryProvided] = useState(false); // Flag to check if summary has been provided

  const handleSubmit = async () => {
    if (!summaryProvided) {
      // Handle summary submission
      if (!paragraph) {
        return Alert.alert("Please enter a summary");
      }

      setSummaryProvided(true); // Set the flag to true

      // Add summary to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'system', text: `Summary provided: ${paragraph}` },
      ]);

      setParagraph(""); // Clear the summary input
    } else {
      // Handle question submission
      if (!question) {
        return Alert.alert("Please enter a question");
      }

      setLoading(true);

      // Add user question to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'user', text: question },
      ]);

      try {
        const response = await fetch("https://5395-103-214-61-57.ngrok-free.app/chat", { // Update this URL
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paragraph: paragraph, question: question }), // Use the stored summary as context
        });

        const data = await response.json();

        if (response.ok) {
          setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: data.answer },
          ]);
        } else {
          Alert.alert("Error", "Failed to get response: " + data.detail);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to get response: " + error.message);
      } finally {
        setLoading(false);
        setQuestion(""); // Clear the question input
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.chatContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.message,
                message.type === 'user' ? styles.userMessage : 
                message.type === 'bot' ? styles.botMessage : styles.systemMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        {!summaryProvided ? (
          <TextInput
            value={paragraph}
            onChangeText={setParagraph}
            placeholder="Enter summary of the lecture"
            placeholderTextColor="#888"
            style={styles.input}
            multiline
          />
        ) : (
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Enter your question"
            placeholderTextColor="#888"
            style={styles.input}
          />
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading...' : summaryProvided ? 'Ask' : 'Submit Summary'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  chatContainer: {
    flex: 1,
  },
  message: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e90ff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e1e1e',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#444',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    padding: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
    backgroundColor: '#121212',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 50,
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatBotScreen;
