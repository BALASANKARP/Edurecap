

# EduRecap: Intelligent Text Summarization and Concept Extraction Tool

## Project Overview

EduRecap is a mobile application designed to enhance the learning experience for students by offering features such as automatic lecture recording and transcription, key point summarization, multilingual support, and chatbot integration. The app helps address challenges like absenteeism and difficulty in taking comprehensive notes during lectures, enabling students to focus on the lecture content.

## Features

- **User Authentication**: Log in and access personalized dashboards.
- **Home Screen**: Displays shared content from users, fostering a collaborative environment.
- **Create Tab**: Upload videos that will be visible on the public home screen.
- **Audio Processing**: Upload or record live audio to generate transcripts, summaries, and flashcards from lectures.
- **Chatbot Integration**: Interact with a chatbot to ask specific questions based on lecture summaries without having to go through the entire lecture.
- **Bookmark Screen**: Store transcripts and audio files, organized by subject for easy retrieval and playback.
- **Profile Management**: View profile details and sign out.

## Video Demonstration

You can [download and watch the video](./path/to/video/demo.mp4) to see a demonstration of EduRecap.

> **Note**: GitHub does not support directly playing videos within the repository. You can click the link above to download and view the demo video.

## Technologies Used

- **Frontend**: React Native, Expo
- **Backend**: FastAPI
- **State Management**: Redux
- **Libraries**: Various libraries for audio processing, text summarization, and chatbot functionality.

## Installation

### Prerequisites

- Node.js and npm (Node Package Manager)
- Expo CLI
- Python (for the backend)
- Required libraries and packages listed in `package.json` (frontend) and `requirements.txt` (backend)

### Steps to Run the Project Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/BALASANKARP/Edurecap.git
   cd Edurecap
   

2. **Install Frontend Dependencies**:
   ```bash
   cd app
   npm install
   ```

3. **Start the Frontend**:
   ```bash
   npm start
   ```

4. **Set Up the Backend**: Navigate to the backend directory and install dependencies:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

5. **Run the Backend**:
   ```bash
   uvicorn fast_api:app --reload
   ```

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository, make your changes, and submit a pull request.
```

In the line `[download and watch the video](./path/to/video/demo.mp4)`, replace `./path/to/video/demo.mp4` with the actual path to your video file within the repo. This link will allow users to download the video from the repository.
