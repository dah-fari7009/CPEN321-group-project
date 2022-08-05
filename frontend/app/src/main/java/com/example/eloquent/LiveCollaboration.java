package com.example.eloquent;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.os.Handler;
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;

import tech.gusavila92.websocketclient.WebSocketClient;



public class LiveCollaboration extends AppCompatActivity {


    private ImageButton nextButton;
    private ImageButton backButton;
    private ImageButton flipButton;
    private ImageButton addButton;
    private ImageButton deleteButton;
    private ImageButton swapnextButton;
    private ImageButton swaplastButton;
    private ImageButton redoButton;
    private ImageButton undoButton;
    private TextView pageNumber;
    private EditText content;
    private Presentation presentation = new Presentation();
    private String presentationID = "62eaf6f05122fb599e75a190";
    private int cueCards_num = 0;
    private int cueCards_max = 0;
    private int cardFace = 0;//0: front | 1: back
    private String userID = "123";
    private String title ;
    private boolean sendOrNot = false;
    private CharSequence textBeforeChange;
    private CharSequence textAfterChange;
    ObjectMapper objectMapper = new ObjectMapper();
    private WebSocketClient webSocketClient;
    private static String TAG = "LiveCollaboration";
    private boolean getPresentationSuccess = false;
    private boolean refreshPageComplete = false;
    public int undoRedoSure = 0;//0: not sure;1: sure

    /**
     * standard empty card (used for add and delete)
     */
    Content new_content_front = new Content(0,"");
    Content new_content_back = new Content(0,"");
    Front new_front = new Front(Color.WHITE,new_content_front);
    Back new_back = new Back(Color.WHITE,new_content_back);
    Cards emptyCard = new Cards(new_front,new_back,Color.WHITE);




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_live_collaboration);
        /**
         * get json from backend server by request
         */

//        presentation = (Presentation) getIntent().getSerializableExtra("specificArgument");
//
//
//        userID = (String) getIntent().getSerializableExtra("userID");




        /**
         * start the websocket connection with the server
         */
        LiveCollaboration.this.runOnUiThread(new Runnable() {
            public void run() {
                createWebSocketClient();
            }
        });

        content = findViewById(R.id.cueCard);




//        try {
//            wait(300);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }

//        try{
//            cueCards_max = presentation.cueCards.size();
//        }
//        catch (Exception e){
//            Content new_content_front = new Content(Color.BLACK,"");
//            Content new_content_back = new Content(Color.BLACK,"");
//            Front new_front = new Front(Color.WHITE,new_content_front);
//            Back new_back = new Back(Color.WHITE,new_content_back);
//            Cards emptyCard = new Cards(new_front,new_back,Color.WHITE);
//            presentation = new Presentation();
//            presentation.cueCards.add(emptyCard);
//            addButtonHelper;
//        }




        View back = findViewById(R.id.cueCard_background);

        while(!getPresentationSuccess){
            //Log.w(TAG, "Wait for presentation");
        }

        back.setBackgroundColor(65280);

        refreshPage();

        content.addTextChangedListener(new TextWatcher() {
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

                if (!sendOrNot) {
                    return;
                }

                JSONObject obj =  new JSONObject();
                try{
                    obj.put("edit","");
                    obj.put("userID",userID);
                    obj.put("presentationID",presentationID);
                    obj.put("cueCards_num",Integer.toString(cueCards_num));
                    obj.put("cardFace",Integer.toString(cardFace));
                    //String recent_text = content.getText().toString();
                    String recent_text = s.toString();
                    obj.put("recent_text",recent_text);
                    textAfterChange = s.subSequence(start, start + count);
                    obj.put("before_text",textBeforeChange);
                    //Editable text = content.getEditableText();
                    //int end = start + count;
                    //text.replace(start, end, textBeforeChange);
                    //textAfterChange = text.toString();
                    //int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
                    //content.setText(getColoredtext(color,recent_text));
                    obj.put("start",start);
                    obj.put("end",start + before);
                    obj.put("undoEnd",start+count);
                    obj.put("diff",count-before);
                }catch (JSONException e){
                    e.printStackTrace();
                }

                webSocketClient.send(obj.toString());
            }

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                if (!sendOrNot) {
                    return;
                }

                textBeforeChange = s.toString();

            }

            @Override
            public void afterTextChanged(Editable s) {


            }
        });



        nextButton = findViewById(R.id.nextButton);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                nextButtonHelper();

            }
        });

        backButton = findViewById(R.id.backButton);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                backButtonHelper();

            }
        });

        flipButton = findViewById(R.id.flipButton);
        flipButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                flipButtonHelper();

            }
        });

        addButton = findViewById(R.id.addButton);
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                addButtonHelper();

            }
        });

        deleteButton = findViewById(R.id.deleteButton);
        deleteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                deleteButtonHelper();

            }
        });

        swapnextButton = findViewById(R.id.swapnextButton);
        swapnextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                swapNextButtonHelper();

            }
        });

        swaplastButton = findViewById(R.id.swaplastButton);
        swaplastButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                swapLastButtonHelper();

            }
        });

        undoButton = findViewById(R.id.undoButton);
        undoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                undoButtonHelper();
            }
        });

        redoButton = findViewById(R.id.redoButton);
        redoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                redoButtonHelper();
            }
        });


    }

    private void redoButtonHelper() {
        JSONObject obj =  new JSONObject();
        try{
            obj.put("redo","");
            obj.put("userID",userID);
            obj.put("presentationID",presentationID);
            obj.put("cueCards_num",Integer.toString(cueCards_num));
            obj.put("cardFace",Integer.toString(cardFace));
            obj.put("undoRedoSure",Integer.toString(undoRedoSure));
        }catch (JSONException e){
            e.printStackTrace();
        }
        webSocketClient.send(obj.toString());
    }

    private void firstHistoryHelper() {
        Toast.makeText(getApplicationContext(),"First history, cannot redo",Toast.LENGTH_SHORT).show();
    }

    private void undoButtonHelper() {

        JSONObject obj =  new JSONObject();
        try{
            obj.put("undo","");
            obj.put("userID",userID);
            obj.put("presentationID",presentationID);
            obj.put("cueCards_num",Integer.toString(cueCards_num));
            obj.put("cardFace",Integer.toString(cardFace));
            obj.put("undoRedoSure",Integer.toString(undoRedoSure));
        }catch (JSONException e){
            e.printStackTrace();
        }
        webSocketClient.send(obj.toString());
    }

    private void undoSureHelper() {
        // Window to show whether undo or not
        Toast.makeText(getApplicationContext(),"undoSureHelper",Toast.LENGTH_SHORT).show();

    }

    private void lastHistoryHelper() {
        Toast.makeText(getApplicationContext(),"Last history, cannot undo",Toast.LENGTH_SHORT).show();
    }

    private void swapLastButtonHelper(){
        if(cueCards_num>0){
            JSONObject obj =  new JSONObject();
            try{
                obj.put("swapLast","");
                obj.put("userID",userID);
                obj.put("presentationID",presentationID);
                obj.put("cueCards_num",Integer.toString(cueCards_num));
                obj.put("cardFace",Integer.toString(cardFace));
            }catch (JSONException e){
                e.printStackTrace();
            }
            webSocketClient.send(obj.toString());
            cardFace = 0;
        }
        else{
            Toast.makeText(getApplicationContext(),"Min number, cannot swap with the last page",Toast.LENGTH_SHORT).show();
        }
    }

    private void swapLastHelper(int cueCards_num) {
        if(cueCards_num>0){
            //
            Cards temp = presentation.getCards(cueCards_num);
            presentation.cueCards.set(cueCards_num,presentation.cueCards.get(cueCards_num-1));
            presentation.cueCards.set(cueCards_num-1,temp);
            refreshPageWithCursor();
        }
        else{
            refreshPresentation();
            refreshPageWithCursor();
        }
    }

    private void swapNextButtonHelper() {
        if(cueCards_num<cueCards_max-1){
            JSONObject obj =  new JSONObject();
            try{
                obj.put("swapNext","");
                obj.put("userID",userID);
                obj.put("presentationID",presentationID);
                obj.put("cueCards_num",Integer.toString(cueCards_num));
            }catch (JSONException e){
                e.printStackTrace();
            }
            webSocketClient.send(obj.toString());
            cardFace=0;
        }
        else{
            Toast.makeText(getApplicationContext(),"Max number, cannot swap with the next page",Toast.LENGTH_SHORT).show();
        }
    }

    private void swapNextHelper(int cueCards_num) {
        if(cueCards_num<cueCards_max-1){
            Cards temp = presentation.getCards(cueCards_num);
            presentation.cueCards.set(cueCards_num,presentation.cueCards.get(cueCards_num+1));
            presentation.cueCards.set(cueCards_num+1,temp);
            refreshPageWithCursor();
        }else{
            refreshPresentation();
            refreshPageWithCursor();
        }

    }

    private void deleteButtonHelper() {
        /**
         * Send the command to the server
         */
        JSONObject obj =  new JSONObject();
        try{
            obj.put("delete","");
            obj.put("userID",userID);
            obj.put("presentationID",presentationID);
            obj.put("cueCards_num",Integer.toString(cueCards_num));
        }catch (JSONException e){
            e.printStackTrace();
        }

        if(cueCards_num>=cueCards_max-1 && cueCards_max!=1){//if this is the last page, go back to previous page
            webSocketClient.send(obj.toString());
            cueCards_num = cueCards_num-1;
        }
        else if(cueCards_max == 1){//if no page left after delete, create a new empty page
            JSONObject objLast =  new JSONObject();
            try{
                objLast.put("deleteLast","");
                objLast.put("userID",userID);
                objLast.put("presentationID",presentationID);
                objLast.put("cueCards_num",Integer.toString(cueCards_num));
            }catch (JSONException e){
                e.printStackTrace();
            }
            webSocketClient.send(objLast.toString());

        }
        else{
            webSocketClient.send(obj.toString());
        }

        cardFace = 0;

    }

    private void deleteHelper(int cueCards_num) {
        for(int i=cueCards_num; i<cueCards_max-1; i=i+1) {
            presentation.cueCards.set(i, presentation.cueCards.get(i + 1));
        }
        presentation.cueCards.remove(cueCards_max-1);
        cueCards_max=cueCards_max-1;
        if(cueCards_num >= cueCards_max){
            cueCards_num--;
            refreshPage();
        }
        else{
            refreshPageWithCursor();
        }

    }

    private void deleteLastHelper () {
        presentation.cueCards.remove(0);
        presentation.cueCards.add(emptyCard);
        refreshPage();
    }

    private void addButtonHelper() {

        /**
         * Send the command to the server
         */
        JSONObject obj =  new JSONObject();
        try{
            obj.put("add","");
            obj.put("userID",userID);
            obj.put("presentationID",presentationID);
            obj.put("cueCards_num",Integer.toString(cueCards_num));
        }catch (JSONException e){
            e.printStackTrace();
        }
        webSocketClient.send(obj.toString());
        cardFace = 0;
    }

    private void addHelper(int cueCards_num) {

        /**
         *  First, change the position of page
         */

        presentation.cueCards.add(emptyCard);
        cueCards_max=cueCards_max+1;
        for(int i=cueCards_max-1; i>cueCards_num; i=i-1) {
            presentation.cueCards.set(i, presentation.cueCards.get(i - 1));
        }
        presentation.cueCards.set(cueCards_num, emptyCard);

        /**
         * Last, refresh page
         */
        refreshPage();

    }

    private void nextButtonHelper() {

        /**
         * first, save the change on the edit text
         */
        sendOrNot = false;


        //second, change to the next page

        if(cueCards_num<cueCards_max-1){
            cueCards_num = cueCards_num+1;
            cardFace=0;
            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
            content.setText(getColoredtext(color,text));
            pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));

        }
        else{
            Toast.makeText(getApplicationContext(),"Max number, cannot go to the next page",Toast.LENGTH_SHORT).show();
        }

        sendOrNot = true;
    }

    private void backButtonHelper() {
        //first, save the change on the edit text


        sendOrNot = false;

        //second, change to the last page

        if(cueCards_num>0){
            cueCards_num = cueCards_num-1;
            cardFace=0;
            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
            content.setText(getColoredtext(color,text));
            pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
        }
        else{
            Toast.makeText(getApplicationContext(),"Min number, cannot go to the last page",Toast.LENGTH_SHORT).show();
        }

        sendOrNot = false;
    }

    private void flipButtonHelper() {
        //save the change on the edit text and flip the page

        sendOrNot = false;
        if(cardFace==0) { //front

//                    Log.w(TAG, "save success");
            cardFace = 1;
            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getBack().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getBack().getContent().getColor();
            content.setText(getColoredtext(color,text));
        }
        else{ // back

//                    Log.w(TAG, "save success");
            cardFace = 0;
            content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
            String text = presentation.getCards(cueCards_num).getFront().getContent().getMessage();
            int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
            content.setText(getColoredtext(color,text));
        }
        sendOrNot = true;
    }



    private void createWebSocketClient() {
        URI uri;
        try {
            // Connect to local host
            uri = new URI("ws://20.104.77.70:80/websocket");
        }
        catch (URISyntaxException e) {
            e.printStackTrace();
            return;
        }

        webSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen() {
                Log.i(TAG + " :WebSocket", "Session is starting");
                JSONObject obj =  new JSONObject();
                try{
                    obj.put("StartLiveCollaboration",0);
                    obj.put("presentationID",presentationID);
                    obj.put("userID",userID);
//                    obj.put("cardFace",Integer.toString(cardFace));
//                    String recent_text = content.getText().toString();
//                    obj.put("recent_text",recent_text);

//                obj.put("mmBefore",tmp.mmBefore.toString());
//                obj.put("mmAfter",tmp.mmAfter.toString());
                }catch (JSONException e){
                    e.printStackTrace();
                }

                webSocketClient.send(obj.toString());
            }

            @Override
            public void onTextReceived(String s) {
                Log.i(TAG + " :WebSocket", "String received");
                Log.i(TAG + " :WebSocket", s);
                receiveMessage(s);
            }

            @Override
            public void onBinaryReceived(byte[] data) {
                Log.i(TAG + " :WebSocket", "Bin received");
                String s = new String(data);
                Log.i(TAG + " :WebSocket", s);
                receiveMessage(s);
            }

            @Override
            public void onPingReceived(byte[] data) {
                Log.i(TAG + " :WebSocket", "Pin received");
            }

            @Override
            public void onPongReceived(byte[] data) {
                Log.i(TAG + " :WebSocket", "Pon received");
            }

            @Override
            public void onException(Exception e) {
                System.out.println(e.getMessage());
                Log.i(TAG + " :WebSocket", "Error");
            }

            @Override
            public void onCloseReceived() {
                Log.i(TAG + " :WebSocket", "Closed ");
                System.out.println("onCloseReceived");
            }
        };

        webSocketClient.enableAutomaticReconnection(1000);
        webSocketClient.connect();
    }

    private void receiveMessage(String s){
        JSONObject tmpjson = null;
        try {
            tmpjson = new JSONObject(s);
        } catch (JSONException e) {
            Log.w(TAG, "Not Json");
            e.printStackTrace();
        }
        if(tmpjson.has("title")){// this is a presentation json

            Log.w(TAG, "newPresentation");
            Presentation tmp_pres = new Presentation();
            //change json to presentation obj
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                Log.w(TAG, "presentation object transformation success1");
                tmp_pres = objectMapper.readValue(s, Presentation.class);
                Log.w(TAG, "presentation object transformation success2");

            } catch (JsonProcessingException e) {
                Log.w(TAG, "presentation object transformation fail");
                e.printStackTrace();
            }

            cueCards_max = tmp_pres.cueCards.size();
            String _id = tmp_pres.presentationID;
            String title = tmp_pres.title;
            int backgroundColor = tmp_pres.cueCards.get(0).backgroundColor;
            String message = tmp_pres.cueCards.get(0).front.content.message;
            Log.w(TAG, String.valueOf(cueCards_max) + "   id: " + _id + "   title: " + title + "   backgroundColor: " + backgroundColor + "    message: " + message);


            //reset presentation
            Log.w(TAG, "newPresentation save");

            presentation = tmp_pres;


            LiveCollaboration.this.runOnUiThread(new Runnable() {
                public void run() {
                    refreshPage();
                    Log.w(TAG, "newPresentation refresh");
                }
            });
            getPresentationSuccess = true;
            return;
        }

        /**
         * Check presentation ID same
         */
        String change_presentationID = null;

        if(tmpjson.has("presentationID")){
            try {
                change_presentationID = tmpjson.getString("presentationID");
            }
            catch (JSONException e) {
                Log.w(TAG, "No PID");
                e.printStackTrace();
                return;
            }

            if(!change_presentationID.equals(presentationID)){
                return;
            }

        }
        int change_cueCards_num = 0;
        try {
            change_cueCards_num = Integer.valueOf(tmpjson.getString("cueCards_num"));
        } catch (JSONException e) {
            e.printStackTrace();
        }


        if (tmpjson.has("add")){
            addHelper(change_cueCards_num);
            Log.w(TAG, "add");
        }
        else if (tmpjson.has("delete")){
            deleteHelper(change_cueCards_num);
            Log.w(TAG, "delete");
        }
        else if (tmpjson.has("deleteLast")){
            deleteLastHelper();
            Log.w(TAG, "deleteLast");
        }
        else if (tmpjson.has("swapLast")){
            swapLastHelper(change_cueCards_num);
            Log.w(TAG, "swapLast");
        }
        else if (tmpjson.has("swapNext")){
            swapNextHelper(change_cueCards_num);
            Log.w(TAG, "swapNext");
        }
        else if(tmpjson.has("edit")) {
            Log.w(TAG, "edit");
            int change_cardFace = 0;
            String change_recent_text = null;
            int change_start = 0;
            int change_end = 0;
            int change_diff = 0;
            String change_userID = null;
            try {
                change_cardFace = Integer.valueOf(tmpjson.getString("cardFace"));
                change_recent_text = tmpjson.getString("recent_text");
                change_start = Integer.valueOf(tmpjson.getString("start"));
                change_end = Integer.valueOf(tmpjson.getString("end"));
                change_diff = Integer.valueOf(tmpjson.getString("diff"));
                change_userID = tmpjson.getString("userID");
            } catch (JSONException e) {
                e.printStackTrace();
            }
            int position_start = content.getSelectionStart();
            int position_end = content.getSelectionEnd();
            int diff = change_diff;


            Log.w(TAG, "!=");
            Cards tmp = presentation.cueCards.get(change_cueCards_num);

            // change variable in presentation Obj

            if(change_cardFace==0) {//front
                tmp.front.content.setMessage(change_recent_text);
                presentation.cueCards.set(change_cueCards_num,tmp);
            }
            else{//back
                tmp.back.content.setMessage(change_recent_text);
                presentation.cueCards.set(cueCards_num,tmp);
            }
            Log.w(TAG, "change save");

            //refresh editText

            if(!change_userID.equals(userID)){
                refreshEditPage(change_start ,change_end,position_start,position_end,diff);
            }


            Log.w(TAG, "change refresh");

//            while(refreshPageComplete){
//                Log.w(TAG, "wait for refreshPage complete");
//            }




        }
        else if(tmpjson.has("undoSure")) {
            Log.w(TAG, "undoSure");
            undoSureHelper();
        }
        else if(tmpjson.has("firstHistory")) {
            Log.w(TAG, "firstHistory");
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    firstHistoryHelper();
                }
            });

        }
        else if(tmpjson.has("lastHistory")) {
            Log.w(TAG, "lastHistory");
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    lastHistoryHelper();
                }
            });
        }
        else {
            Log.w(TAG, "Warning: Unexpected message received");
            refreshPresentation();
        }

    }

    private void refreshPageWithCursor() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                int position_start = content.getSelectionStart();
                int position_end = content.getSelectionEnd();

                cueCards_max = presentation.cueCards.size();
                sendOrNot = false;
                if(cardFace == 0){
                    //content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).front.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }
                else{
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).back.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getBack().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }

                pageNumber = findViewById(R.id.pageNumber);
                pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
                sendOrNot = true;

                content.setSelection(position_start,position_end);
            }
        });

    }


    private void refreshPage() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                refreshPageComplete = false;
                cueCards_max = presentation.cueCards.size();
                sendOrNot = false;
                if(cardFace == 0){
                    //content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).front.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }
                else{
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).back.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getBack().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }

                pageNumber = findViewById(R.id.pageNumber);
                pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
                sendOrNot = true;
                refreshPageComplete = true;
            }
        });

    }

    private void refreshEditPage(int change_start ,int change_end, int position_start, int position_end, int diff) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                refreshPageComplete = false;
                cueCards_max = presentation.cueCards.size();
                sendOrNot = false;
                if(cardFace == 0){
                    //content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).front.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getFront().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }
                else{
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackgroundColor(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.cueCards.get(cueCards_num).back.getContent().getMessage();
                    Log.w(TAG, "text: " + text);
                    int color = presentation.getCards(cueCards_num).getBack().getContent().getColor();
                    content.setText(getColoredtext(color,text));
                }

                pageNumber = findViewById(R.id.pageNumber);
                pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
                sendOrNot = true;
                refreshPageComplete = true;

                if(change_end<=position_start){
                    Log.w(TAG, "state1");
                    Log.w(TAG, "position_start+diff  " + position_start+diff + "   position_end+diff  " + position_end+diff);
                    try{
                        content.setSelection(position_start+diff);
                    }
                    catch (Exception e){

                    }
                }
                else if(change_start<=position_start && change_end > position_start && change_end <= position_end){
                    Log.w(TAG, "state2");
                    try{
                        content.setSelection(change_end+diff,position_end+diff);
                    }catch (Exception e) {

                    }
                    Log.w(TAG, "change_end+diff  " + change_end+diff + "   position_end+diff  " + position_end+diff);
                }
                else if(change_start<=position_start && change_end > position_end){
                    Log.w(TAG, "state3");
                    try{
                        content.setSelection(position_start);
                    }catch (Exception e) {

                    }
                    Log.w(TAG, "change_start  " + position_start);
                }
                else if(change_start>position_start && change_start <= position_end && change_end > position_end){
                    Log.w(TAG, "state4");
                    try{
                        content.setSelection(position_start,change_start);
                    }catch (Exception e) {

                    }

                    Log.w(TAG, "position_start  " + position_start + "   change_start  " + change_start);
                }
                else if(change_start> position_end){
                    Log.w(TAG, "state5");
                    try{
                        content.setSelection(position_start,position_end);
                    }catch (Exception e) {

                    }

                    Log.w(TAG, "position_start  " + position_start + "   position_end  " + position_end);
                }
                else if(change_start> position_start && change_end <= position_end){
                    Log.w(TAG, "state6");
                    try{
                        content.setSelection(position_start);
                    }catch (Exception e) {

                    }
                    Log.w(TAG, "change_start  " + position_start);
                }
                else{
                    Log.w(TAG, "select position problem");
                }
            }
        });

    }

    private void refreshPresentation() {
        JSONObject obj =  new JSONObject();
        try{
            obj.put("refreshPresentation","");
            obj.put("userID",userID);
            obj.put("presentationID",presentationID);
        }catch (JSONException e){
            e.printStackTrace();
        }
        webSocketClient.send(obj.toString());
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
            Log.d(TAG, "back button pressed");
            webSocketClient.close();
//            try {
//                String presentationJson = objectMapper.writeValueAsString(presentation);
//            } catch (JsonProcessingException e) {
//                e.printStackTrace();
//            }
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

}
