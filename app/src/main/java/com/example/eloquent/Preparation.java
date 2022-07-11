package com.example.eloquent;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.text.Editable;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

public class Preparation extends AppCompatActivity {

    private Button nextButton;
    private Button backButton;
    private Button flipButton;
    private TextView pageNumber;
    private EditText content;
    private Presentation presentation = new Presentation("1",1);
    private int cueCards_num = 0;
    private int content_num = 0;
    private int cardFace = 0;//0: front | 1: back


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_preparation);

        //get json from backend



        //then change json to pres obj

        int cueCards_max = 3;

//        Content content1 = new Content(Color.BLUE,"1Front");
//        Content content2 = new Content(Color.BLUE,"1Back");
//        Back back1 = new Back(Color.BLACK);
//        back1.content[0]=content2;
//        Front front1 = new Front(Color.WHITE);
//        front1.content[0]=content1;
//        Cards card1 = new Cards(front1,back1,Color.WHITE);
//
//        Content content3 = new Content(Color.BLUE,"2Front");
//        Content content4 = new Content(Color.BLUE,"2Back");
//        Back back2 = new Back(Color.BLACK);
//        back2.content[0]=content4;
//        Front front2 = new Front(Color.WHITE);
//        front2.content[0]=content3;
//        Cards card2 = new Cards(front2,back2,Color.WHITE);
//
//        Content content5 = new Content(Color.BLUE,"3Front");
//        Content content6 = new Content(Color.BLUE,"3Back");
//        Back back3 = new Back(Color.BLACK);
//        back3.content[0]=content6;
//        Front front3 = new Front(Color.WHITE);
//        front3.content[0]=content5;
//        Cards card3 = new Cards(front3,back3,Color.WHITE);
//
//        presentation.setPresentationcard(cueCards_max);
//
//        presentation.cueCards[0] = card1;
//        presentation.cueCards[1] = card2;
//        presentation.cueCards[2] = card3;
//        Log.w("TAG", "set success");

        //start page


        //!!!!!!!!!!


        pageNumber = findViewById(R.id.pageNumber);
        pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));

        View back = findViewById(R.id.cueCard_background);
        back.setBackgroundColor(65280);

        content = findViewById(R.id.cueCard);
        content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackground_color(), PorterDuff.Mode.SRC_ATOP);
//        Log.w("TAG", "background color success"+"|| cue card number is " +Integer.toString(cueCards_num));
//        Log.w("TAG", "background color is " +Integer.toString(presentation.getCards(cueCards_num).getFront().getBackground_color()));
        String text = presentation.cueCards[cueCards_num].front.getContent(content_num).getMessage();
//        Log.w("TAG", "text is " +text);
        int color = presentation.getCards(cueCards_num).getFront().getContent(content_num).getColor();
        content.setText(getColoredtext(color,text));
//        Log.w("TAG", "text success"+"|| cue card number is " +Integer.toString(cueCards_num));
        //content.setText(presentation.getCards(cueCards_num).getFront().getContent(content_num).getMessage());


        nextButton = findViewById(R.id.nextButton);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text


                String change = content.getText().toString();
//                Log.w("TAG", "get success" + change);

                if(cardFace==0) {
                    presentation.cueCards[cueCards_num].front.content[content_num].setMessage(change);
                }
                else{
                    presentation.cueCards[cueCards_num].back.content[content_num].setMessage(change);
                }
//                Log.w("TAG", "save success");

                //second, change to the next page

                if(cueCards_num<cueCards_max-1){
                    cueCards_num = cueCards_num+1;
                    cardFace=0;
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackground_color(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.getCards(cueCards_num).getFront().getContent(0).getMessage();
                    int color = presentation.getCards(cueCards_num).getFront().getContent(0).getColor();
                    content.setText(getColoredtext(color,text));
                    pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));

                }
                else{
                    // Toast.makeText("Max number, cannot go to the next page",0,Toast.LENGTH_SHORT);
                }



            }
        });

        backButton = findViewById(R.id.backButton);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text


                String change = content.getText().toString();

                if(cardFace==0) { //front
                    presentation.cueCards[cueCards_num].front.content[content_num].setMessage(change);
                }
                else{ // back
                    presentation.cueCards[cueCards_num].back.content[content_num].setMessage(change);
                }
//                Log.w("TAG", "save success");

                //second, change to the last page

                if(cueCards_num>0){
                    cueCards_num = cueCards_num-1;
                    cardFace=0;
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackground_color(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.getCards(cueCards_num).getFront().getContent(0).getMessage();
                    int color = presentation.getCards(cueCards_num).getFront().getContent(0).getColor();
                    content.setText(getColoredtext(color,text));
                    pageNumber.setText(Integer.toString(cueCards_num+1)+"/"+Integer.toString(cueCards_max));
                }
                else{
                    // Toast.makeText("Min number, cannot go to the last page",0,Toast.LENGTH_SHORT);
                }

            }
        });

        flipButton = findViewById(R.id.flipbutton);
        flipButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //save the change on the edit text and flip the page
                String change = content.getText().toString();

                if(cardFace==0) { //front
                    presentation.cueCards[cueCards_num].front.content[content_num].setMessage(change);
//                    Log.w("TAG", "save success");
                    cardFace = 1;
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getBack().getBackground_color(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.getCards(cueCards_num).getBack().getContent(0).getMessage();
                    int color = presentation.getCards(cueCards_num).getBack().getContent(0).getColor();
                    content.setText(getColoredtext(color,text));
                }
                else{ // back
                    presentation.cueCards[cueCards_num].back.content[content_num].setMessage(change);
//                    Log.w("TAG", "save success");
                    cardFace = 0;
                    content.getBackground().setColorFilter(presentation.getCards(cueCards_num).getFront().getBackground_color(), PorterDuff.Mode.SRC_ATOP);
                    String text = presentation.getCards(cueCards_num).getFront().getContent(0).getMessage();
                    int color = presentation.getCards(cueCards_num).getFront().getContent(0).getColor();
                    content.setText(getColoredtext(color,text));
                }


            }
        });




    }

    private Spannable getColoredtext(int color, String text){
        Spannable colored_text = new SpannableString(text);
        colored_text.setSpan(new ForegroundColorSpan(color),0,text.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        return colored_text;
    }
}