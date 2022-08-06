package com.example.eloquent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.Log;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.LinearLayout.LayoutParams;
import android.widget.Toast;

import java.util.ArrayList;

public class Presenting extends AppCompatActivity implements RecognitionListener {

    private boolean isOnFront = true;
    private int currentCard = 0;
    Presentation pres;

    private Intent speechRecognizerIntent;
    private String TAG = "Presenting";

    public static final Integer RecordAudioRequestCode = 1;
    private SpeechRecognizer speechRecognizer;
    private TextView speechText;
    private LinearLayout linearLayout;

    @SuppressLint("ClickableViewAccessibility")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_presenting);

        pres = (Presentation) getIntent().getSerializableExtra("Presentation");
        linearLayout = (LinearLayout) findViewById(R.id.linear_lay);
        fillLayout(linearLayout, pres, 0, isOnFront);


        linearLayout.setOnTouchListener(new OnSwipeTouchListener(Presenting.this) {
            public void onSwipeLeft() {
                if (currentCard >= pres.cueCards.size() - 1) {
                    Toast.makeText(Presenting.this, "No more cards!", Toast.LENGTH_SHORT).show();
                    return;
                }

                linearLayout.removeAllViews();
                currentCard++;
                fillLayout(linearLayout, pres, currentCard, isOnFront);
            }

            public void onSwipeRight() {
                if (currentCard <= 0) {
                    Toast.makeText(Presenting.this, "No more cards!", Toast.LENGTH_SHORT).show();
                    return;
                }

                linearLayout.removeAllViews();
                currentCard--;
                fillLayout(linearLayout, pres, currentCard, isOnFront);
            }

            public void onSwipeBottom() {
                linearLayout.removeAllViews();

                //display other side of card
                isOnFront = !isOnFront;
                fillLayout(linearLayout, pres, currentCard, isOnFront);
            }

            public void onSwipeTop() {
                linearLayout.removeAllViews();

                //display other side of card
                isOnFront = !isOnFront;
                fillLayout(linearLayout, pres, currentCard, isOnFront);
            }
        });

        //get permissions for audio
//        if(ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED){
//            checkPermission();
//        }
        speechText = findViewById(R.id.speech_text);

        resetSpeechRecognizer();
        createRecognizerIntent();
        speechRecognizer.startListening(speechRecognizerIntent);
    }

    //stop listening when activity is paused
    @Override
    protected void onPause() {
        super.onPause();
        speechRecognizer.stopListening();
    }

    //start listening when activity is resumed
    @Override
    protected void onResume() {
        super.onResume();
        resetSpeechRecognizer();
        speechRecognizer.startListening(speechRecognizerIntent);
    }

    //stop listening when activity is stopped
    @Override
    protected void onStop() {
        super.onStop();
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
    }

    //dynamically create a textview
    //modified from https://stackoverflow.com/questions/4203506/how-to-add-a-textview-to-a-linearlayout-dynamically-in-android
    public TextView createTextView(Presentation pres, int cardIndex, boolean isOnFront) {
        TextView textView1 = new TextView(Presenting.this);
        textView1.setLayoutParams(new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
        SpannableString spannable;
        String content;
        if (isOnFront) {
            spannable = getColoredText(pres.cueCards.get(cardIndex).front.content.colour, pres.cueCards.get(cardIndex).front.content.message);
//            content = pres.cueCards.get(cardIndex).front.content.message;
        } else {
            spannable = getColoredText(pres.cueCards.get(cardIndex).back.content.colour, pres.cueCards.get(cardIndex).back.content.message);
//            content = pres.cueCards.get(cardIndex).back.content.message;
        }
        textView1.setText(spannable);
        textView1.setBackgroundColor(0xffffffff); // hex color 0xAARRGGBB
        textView1.setPadding(20, 20, 20, 20);// in pixels (left, top, right, bottom)
        Log.d(TAG, String.valueOf(textView1.getText()));

        return textView1;
    }

    //populate a linear layout with all messages in a content array
    public void fillLayout (LinearLayout linearLayout, Presentation pres, int cardIndex, boolean isOnFront) {
        linearLayout.addView(createTextView(pres, cardIndex, isOnFront));
    }

    private void createRecognizerIntent() {
        speechRecognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
    }

    private void resetSpeechRecognizer() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);

        if (speechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer.setRecognitionListener(this);
        } else {
            finish();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if ((requestCode == RecordAudioRequestCode && grantResults.length > 0) && grantResults[0] == PackageManager.PERMISSION_GRANTED){
            Toast.makeText(this,"Permission Granted",Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onReadyForSpeech(Bundle params) {
        // nothing to be done here
    }

    @Override
    public void onBeginningOfSpeech() {
        // nothing to be done here
    }

    @Override
    public void onRmsChanged(float rmsdB) {
        // nothing to be done here
    }

    @Override
    public void onBufferReceived(byte[] buffer) {
        // nothing to be done here
    }

    @Override
    public void onEndOfSpeech() {
        speechRecognizer.stopListening();
    }

    @Override
    public void onError(int error) {
        Log.d(TAG, "Error: " + error);
        resetSpeechRecognizer();
        speechRecognizer.startListening(speechRecognizerIntent);
    }

    @Override
    public void onResults(Bundle results) {
        ArrayList<String> data = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (!data.get(0).equals(null)) {
            speechText.setText(data.get(0));
            String[] words = data.get(0).toLowerCase().split("\\w+");
            int transitionPhraseWordsCount = pres.cueCards.get(currentCard).transitionPhrase.split("\\w+").length;
            // number of words that are correctly pronounced
            int correct = 0;
            //see if a substring in the text matches the transition phrase, ignoring case and punctuation
            for (int i = 0; i < transitionPhraseWordsCount; i++) {
                if (pres.cueCards.get(currentCard).transitionPhrase.toLowerCase().contains(words[i])) {
                    correct ++;
                }
            }
            if ((double)(correct / transitionPhraseWordsCount) > 0.5) {
                if (currentCard >= pres.cueCards.size() - 1) {
                    Toast.makeText(Presenting.this, "No more cards!", Toast.LENGTH_SHORT).show();
                    return;
                }


                linearLayout.removeAllViews();
                currentCard++;
                fillLayout(linearLayout, pres, currentCard, isOnFront);
            }
        }

        speechRecognizer.startListening(speechRecognizerIntent);
    }

    @Override
    public void onPartialResults(Bundle partialResults) {
        // nothing to be done here
    }

    @Override
    public void onEvent(int eventType, Bundle params) {
        // nothing to be done here
    }

    private SpannableString getColoredText(int color, String text){
        SpannableString colored_text = new SpannableString(text);

        int[] colorPalette = {
                Color.BLACK,
                Color.WHITE,
                Color.RED,
                Color.GREEN,
                Color.BLUE,
                Color.GRAY,
                Color.YELLOW,
                Color.CYAN,
                Color.MAGENTA
        };

        colored_text.setSpan(new ForegroundColorSpan(colorPalette[color]),0,text.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        return colored_text;
    }
}
