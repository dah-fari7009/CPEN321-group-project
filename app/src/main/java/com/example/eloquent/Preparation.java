package com.example.eloquent;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.text.Editable;
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
    private Presentation presentation;
    private int cueCards_num = 0;
    private int content_num = 0;
    private int cardFace = 0;//0: front | 1: back

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_preparation);

        //get json from backend



        //then change json to pres obj



        //start page

        int cueCards_max = 12;//!!!!!!!!!!


        View back = findViewById(R.id.cueCard_background);
        back.setBackgroundColor(111);

        content = findViewById(R.id.cueCard);
        content.setBackgroundColor(111);
        content.setText(presentation.getCards(cueCards_num).getFront().getContent(content_num).getMessage());


        nextButton = findViewById(R.id.nextButton);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //first, save the change on the edit text


                String change = content.getText().toString();

                if(cardFace==0) {
                    presentation.cueCards[cueCards_num].front.content[content_num].setMessage(change);
                }
                else{
                    presentation.cueCards[cueCards_num].back.content[content_num].setMessage(change);
                }

                //second, change to the next page

                if(cueCards_num<cueCards_max){
                    cueCards_num = cueCards_num+1;
                    content.setText(presentation.getCards(cueCards_num).getFront().getContent(0).getMessage());
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

                //second, change to the last page

                if(cueCards_num>0){
                    cueCards_num = cueCards_num-1;
                    content.setText(presentation.getCards(cueCards_num).getFront().getContent(0).getMessage());
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
                    cardFace = 1;
                    content.setText(presentation.getCards(cueCards_num).getBack().getContent(0).getMessage());
                }
                else{ // back
                    presentation.cueCards[cueCards_num].back.content[content_num].setMessage(change);
                    cardFace = 0;
                    content.setText(presentation.getCards(cueCards_num).getFront().getContent(0).getMessage());
                }


            }
        });

        pageNumber = findViewById(R.id.pageNumber);
        pageNumber.setText(Integer.toString(cueCards_num)+"/"+Integer.toString(cueCards_max));

    }
}