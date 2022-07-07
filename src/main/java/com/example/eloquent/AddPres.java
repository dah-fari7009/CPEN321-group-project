package com.example.eloquent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.util.Calendar;

public class AddPres extends AppCompatActivity {

    private Toolbar toolbar;
    private EditText presTitle, presDescription;
    private Calendar calendar;
    private String todaysDate;
    private String currentTime;
    private Button preparationBut;
    private Button presentingBut;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_pres);

        toolbar = findViewById(R.id.toolbar);
        toolbar.setTitleTextColor(getResources().getColor(R.color.white));
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle("New Presentation");
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        presTitle = findViewById(R.id.presTitle);
        presDescription = findViewById(R.id.presDescription);

        preparationBut = findViewById(R.id.preparation);
        preparationBut.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent preparationIntent = new Intent(AddPres.this, Preparation.class);
                startActivity(preparationIntent);
            }
        });

        presentingBut = findViewById(R.id.presenting);
        presentingBut.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent presentingIntent = new Intent(AddPres.this, Presenting.class);
                startActivity(presentingIntent);
            }
        });

        presTitle.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(s.length() != 0) {
                    getSupportActionBar().setTitle(s);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        //get current date and time
        calendar = Calendar.getInstance();
        todaysDate = calendar.get(Calendar.YEAR) + "/" + (calendar.get(Calendar.MONTH)+1) + "/" + calendar.get(Calendar.DAY_OF_MONTH);
        currentTime = pad(calendar.get(Calendar.HOUR)) + ":" + pad(calendar.get(Calendar.MINUTE));
    }

    // if the hour or minute is less than 10, add 0 before it
    private String pad(int i) {
        if(i < 10) {
            return "0" + i;
        }
        return String.valueOf(i);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.save_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if(item.getItemId() == R.id.delete) {
            Toast.makeText(this, "Delete btt is clicked", Toast.LENGTH_SHORT).show();
        }
        if(item.getItemId() == R.id.save) {
            Toast.makeText(this, "Save btt is clicked", Toast.LENGTH_SHORT).show();
        }
        return super.onOptionsItemSelected(item);
    }
}