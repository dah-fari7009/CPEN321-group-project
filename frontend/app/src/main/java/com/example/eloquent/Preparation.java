package com.example.eloquent;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.text.Editable;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.TextWatcher;
import android.text.style.ForegroundColorSpan;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Preparation extends AppCompatActivity {


    private TextView pageNumber;
    private EditText content;
    private TextViewUndoRedo helper;
    private Presentation presentation;
    private int cueCards_num = 0;
    private int cueCards_max = 0;
    private int cardFace = 0;//0: front | 1: back
    ObjectMapper objectMapper = new ObjectMapper();

    private static final String TAG = "Preparation";

    private String BACKEND_HOST_AND_PORT;
    private static RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_preparation);
        BACKEND_HOST_AND_PORT = getString(R.string.backend_host);

        /* Set up for sending HTTP requests */
        requestQueue = Volley.newRequestQueue(getApplicationContext());

        /* Button variables */
        ImageButton nextButton;
        ImageButton backButton;
        ImageButton flipButton;
        ImageButton addButton;
        ImageButton deleteButton;
        ImageButton swapnextButton;
        ImageButton swaplastButton;
        ImageButton redoButton;
        ImageButton undoButton;

        /* Retrieve presentation object */
        presentation = (Presentation) getIntent().getSerializableExtra("Presentation");

        try{
            cueCards_max = presentation.cueCards.size();
        }
        catch (Exception e){
            Content new_content_front = new Content(Color.BLACK,"");
            Content new_content_back = new Content(Color.BLACK,"");
            Front new_front = new Front(Color.WHITE,new_content_front);
            Back new_back = new Back(Color.WHITE,new_content_back);
            Cards emptyCard = new Cards(new_front,new_back,Color.WHITE);
            presentation = new Presentation();
            presentation.cueCards.add(emptyCard);
            cueCards_max = presentation.cueCards.size();
        }

        Log.w("TAG", Integer.toString(cueCards_max));

        /* Set up UI elements */
        pageNumber = findViewById(R.id.pageNumber);
        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));

        View back = findViewById(R.id.cueCard_background);
        back.setBackgroundColor(65280);

        content = findViewById(R.id.cueCard);
        helper = new TextViewUndoRedo(content);
        content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
//        Log.w("TAG", "background color success"+"|| cue card number is " +Integer.toString(cueCards_num));
//        Log.w("TAG", "background color is " +Integer.toString(presentation.getCards(cueCards_num).getFront().getBackground_color()));
        String text = presentation.cueCards.get(cueCards_num).front.getContent().getMessage();
//        Log.w("TAG", "text is " +text);
        int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
        content.setText(getColoredtext(color,text));
//        Log.w("TAG", "text success"+"|| cue card number is " +Integer.toString(cueCards_num));
        //content.setText(presentation.getCards(cueCards_num).getFront().getContent(content_num).getMessage());
        Log.w("TAG", "OK");

        content.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                // Nothing to be done
            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                if (cardFace == 1) {
                    String cardDetails[] = content.getText().toString().split(">");
                    presentation.cueCards.get(cueCards_num).transitionPhrase = cardDetails[cardDetails.length - 1];
                }
            }

            @Override
            public void afterTextChanged(Editable editable) {
                // Nothing to be done
            }
        });

        /* Set up on-click handlers for buttons */
        nextButton = findViewById(R.id.nextButton);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //first, save the change on the edit text
                Log.w("TAG", "nextButton");
                nextHelper();
            }
        });

        backButton = findViewById(R.id.backButton);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text
                Log.w("TAG", "backButton");
                backHelper();

            }
        });

        flipButton = findViewById(R.id.flipButton);
        flipButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //save the change on the edit text and flip the page
                Log.w("TAG", "flipButton");
                flipHelper();

            }
        });

        addButton = findViewById(R.id.addButton);
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text
                addHelper();
            }
        });

        deleteButton = findViewById(R.id.deleteButton);
        deleteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                deleteHelper();
            }
        });

        swapnextButton = findViewById(R.id.swapnextButton);
        swapnextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text

                swapNextHelper();
            }
        });

        swaplastButton = findViewById(R.id.swaplastButton);
        swaplastButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text

                swapLastHelper();
            }
        });

        undoButton = findViewById(R.id.undoButton);
        undoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                helper.undo();
            }
        });

        redoButton = findViewById(R.id.redoButton);
        redoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                helper.redo();
            }
        });


    }

    private void swapLastHelper() {
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);
//                Log.w("TAG", "get success" + change);

        if(cardFace==0) {
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
        else{
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }


        //Second, change page position

        if(cueCards_num>0){
            //
            Cards temp = presentation.getCards(cueCards_num);
            presentation.cueCards.set(cueCards_num,presentation.cueCards.get(cueCards_num-1));
            presentation.cueCards.set(cueCards_num-1,temp);

            cardFace = 0;

            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

            content.setText(getColoredtext(color,text));

        }
        else{
            Toast.makeText(getApplicationContext(),"Min number, cannot swap with the last page",Toast.LENGTH_SHORT).show();
        }



        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
        helper.clearHistory();
    }

    private void swapNextHelper() {
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);
//                Log.w("TAG", "get success" + change);

        if(cardFace==0) {
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
        else{
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }


        //Second, change page position

        if(cueCards_num<cueCards_max-1){
            //
            Cards temp = presentation.getCards(cueCards_num);
            presentation.cueCards.set(cueCards_num,presentation.cueCards.get(cueCards_num+1));
            presentation.cueCards.set(cueCards_num+1,temp);

            cardFace = 0;

            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

            content.setText(getColoredtext(color,text));

        }
        else{
            Toast.makeText(getApplicationContext(),"Max number, cannot swap with the next page",Toast.LENGTH_SHORT).show();
        }



        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
        helper.clearHistory();
    }

    private void deleteHelper() {
        createDialog();
        //Don't need to save because the content will be deleted

        //change page position

        for(int i=cueCards_num; i<cueCards_max-1; i=i+1) {
            presentation.cueCards.set(i, presentation.cueCards.get(i + 1));
        }

        presentation.cueCards.remove(cueCards_max-1);
        cueCards_max=cueCards_max-1;

        if(cueCards_num>cueCards_max-1 && cueCards_max!=0){//if this is the last page, go back to previous page
            cueCards_num = cueCards_num-1;
        }
        else if(cueCards_max == 0){//if no page left after delete, create a new empty page
            Content new_content_front = new Content(0,""); // colour==0 means black
            Content new_content_back = new Content(0,"");
            Front new_front = new Front(1); // backgroundColor==1 means white
            new_front.content=new_content_front;
            Back new_back = new Back(1);
            new_back.content=new_content_back;
            Cards new_card = new Cards(new_front,new_back,1);
            presentation.cueCards.add(new_card);
            cueCards_max=cueCards_max+1;
        }
//                Log.w("TAG", "get max : " + cueCards_max);
//                Log.w("TAG", "get num : " + (cueCards_num+1));

        cardFace=0;

        content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
        String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
        int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

        content.setText(getColoredtext(color,text));

        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
        helper.clearHistory();
    }

    private void addHelper() {
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);
//                Log.w("TAG", "get success" + change);

        if(cardFace==0) {
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
        else{
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
//                Log.w("TAG", "save success");

        //second, create a new page

        Content new_content_front = new Content(0,""); // colour==0 means black
        Content new_content_back = new Content(0,"");
        Front new_front = new Front(1); // backgroundColor==1 means white
        new_front.content=new_content_front;
        Back new_back = new Back(1);
        new_back.content=new_content_back;
        Cards new_card = new Cards(new_front,new_back, 1);

        //Third, change page position

        presentation.cueCards.add(new_card);
        cueCards_max=cueCards_max+1;
        for(int i=cueCards_max-1; i>cueCards_num; i=i-1) {
            presentation.cueCards.set(i, presentation.cueCards.get(i - 1));
        }
        presentation.cueCards.set(cueCards_num, new_card);

        cardFace=0;

        content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
        String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
        int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

        content.setText(getColoredtext(color,text));

        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
        helper.clearHistory();
    }

    private void flipHelper() {
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);

        if(cardFace==0) { //front
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
//                    Log.w("TAG", "save success");
            cardFace = 1;
            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getBack().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getBack().getContent().getColor();
            content.setText(getColoredtext(color,text));
        }
        else{ // back
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
//                    Log.w("TAG", "save success");
            cardFace = 0;

            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

            content.setText(getColoredtext(color,text));
        }

        helper.clearHistory();
    }

    private void backHelper() {
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);

        if(cardFace==0) { //front
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
        else{ // back
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
        }
//                Log.w("TAG", "save success");

        //second, change to the last page

        if(cueCards_num>0){
            cueCards_num = cueCards_num-1;
            cardFace=0;

            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

            content.setText(getColoredtext(color,text));
            pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
            helper.clearHistory();
        }
        else{
            //Toast.makeText(getApplicationContext(),"Min number, cannot go to the last page",Toast.LENGTH_SHORT).show();
        }
    }

    private void nextHelper() {
        Log.w("TAG", Integer.toString(1));
        String change = content.getText().toString();
        Cards tmp = presentation.cueCards.get(cueCards_num);
//                Log.w("TAG", "get success" + change);
        Log.w("TAG", Integer.toString(2));
        if(cardFace==0) {//front
            tmp.front.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
            Log.w("TAG", "front");
        }
        else{//back
            tmp.back.content.setMessage(change);
            presentation.cueCards.set(cueCards_num,tmp);
            Log.w("TAG", "back");
        }
//                Log.w("TAG", "save success");

        //second, change to the next page

        if(cueCards_num<cueCards_max-1){
            cueCards_num = cueCards_num+1;
            cardFace=0;

            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

            content.setText(getColoredtext(color,text));
            pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
            helper.clearHistory();
            Log.w("TAG", "next");

        }
        else{
            Toast.makeText(getApplicationContext(),"Max number, cannot go to the next page",Toast.LENGTH_SHORT).show();
            Log.w("TAG", "error");
        }
    }

    private void createDialog() {
        AlertDialog.Builder adb = new AlertDialog.Builder(this);
        adb.setMessage("Are you sure you want to make this action?");
        adb.setCancelable(false);

        adb.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int index) {
                for(int i=cueCards_num; i<cueCards_max-1; i=i+1) {
                    presentation.cueCards.set(i, presentation.cueCards.get(i + 1));
                }

                presentation.cueCards.remove(cueCards_max-1);
                cueCards_max=cueCards_max-1;

                if(cueCards_num>cueCards_max-1 && cueCards_max!=0){//if this is the last page, go back to previous page
                    cueCards_num = cueCards_num-1;
                }
                else if(cueCards_max == 0){//if no page left after delete, create a new empty page
                    Content new_content_front = new Content(0,""); // colour==0 means black
                    Content new_content_back = new Content(0,"");
                    Front new_front = new Front(1); // backgroundColor==1 means white
                    new_front.content=new_content_front;
                    Back new_back = new Back(1);
                    new_back.content=new_content_back;
                    Cards new_card = new Cards(new_front,new_back,1);
                    presentation.cueCards.add(new_card);
                    cueCards_max=cueCards_max+1;
                }
//                Log.w("TAG", "get max : " + cueCards_max);
//                Log.w("TAG", "get num : " + (cueCards_num+1));

                cardFace=0;

                content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
                int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();

                content.setText(getColoredtext(color,text));

                pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
                helper.clearHistory();
            }
        });
    }

    private Spannable getColoredtext(int color, String text){
        Spannable colored_text = new SpannableString(text);

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

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK)) {
            Log.d("TAG", "back button pressed");
            String change = content.getText().toString();
            Cards tmp = presentation.cueCards.get(cueCards_num);
//                Log.w("TAG", "get success" + change);
            Log.w("TAG", Integer.toString(2));
            if(cardFace==0) {//front
                tmp.front.content.setMessage(change);
                presentation.cueCards.set(cueCards_num,tmp);
                Log.w("TAG", "front");
            }
            else{//back
                tmp.back.content.setMessage(change);
                presentation.cueCards.set(cueCards_num,tmp);
                Log.w("TAG", "back");
            }
            saveTitleAndGoToMainActivity(presentation.presentationID, null);
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        boolean fromNewActivity=true;

        Intent mainIntent = new Intent(this, MainActivity.class);
        Bundle bundleObj = new Bundle();
        bundleObj.putString("fromNewActivity", Boolean.toString(fromNewActivity));
        mainIntent.putExtras(bundleObj);
        startActivityForResult(mainIntent, 0);
    }

    /**
     * @brief Updates the entire presentation object in backend.
     * @param presID: String, presentationID field of a presentation object.
     * @param responseListener: Response.Listener<JSONObject>, its onResponse callback is used on HTTP
     *                        response. If null, uses a default Response.Listener\<\> whose onResponse
     *                        callback simply logs the received HTTP response.
     */
    private void saveTitleAndGoToMainActivity(String presID, Response.Listener<JSONObject> responseListener) {
        String url = BACKEND_HOST_AND_PORT + "/api/savePresentation"; // BACKEND_HOST_AND_PORT doesn't end with a "/"!
        if (responseListener == null) {
            responseListener = new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    Log.d(TAG, response.toString());
                }
            };
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String cardsJsonString;
        String feedbackJsonString;
        JSONArray cards;
        JSONArray feedback;
        JSONObject body = new JSONObject();
        try {
            cardsJsonString = objectMapper.writeValueAsString(presentation.cueCards);
            feedbackJsonString = objectMapper.writeValueAsString(presentation.feedback);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            throw new NullPointerException();
        }

        try {
            cards = new JSONArray(cardsJsonString);
            feedback = new JSONArray(feedbackJsonString);
            body.put("presID", presID);
            body.put("title", presentation.getTitle());
            body.put("cards", cards);
            body.put("feedback", feedback);
        } catch (JSONException e) {
            e.printStackTrace();
            throw new NullPointerException();
        }

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.PUT, url, body, responseListener, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        });

        requestQueue.add(jsonObjectRequest);
    }

}
