package com.example.eloquent;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
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

import com.google.gson.Gson;

import java.util.Calendar;

public class EditPres extends AppCompatActivity {

    private Toolbar toolbar;
    private EditText presTitle, presDescription;
    private Calendar calendar;
    private String todaysDate;
    private String currentTime;
    private Button preparationBtn;
    private Button presentingBtn;
    private Button liveCollabBtn;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_pres);

        Presentation presentation = (Presentation) getIntent().getSerializableExtra("Presentation");

        toolbar = findViewById(R.id.toolbar);
        toolbar.setTitleTextColor(getResources().getColor(R.color.white));
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(presentation.getTitle());
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        presTitle = findViewById(R.id.presTitle);
        presDescription = findViewById(R.id.presDescription);
        preparationBtn = findViewById(R.id.preparationButton);
        presentingBtn = findViewById(R.id.presentingButton);
        liveCollabBtn = findViewById(R.id.liveCollabButton);

        preparationBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent preparationIntent = new Intent(EditPres.this, Preparation.class);
                preparationIntent.putExtra("Presentation", presentation);
                startActivity(preparationIntent);
            }
        });

        presentingBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent presentingIntent = new Intent(EditPres.this, Presenting.class);
                startActivity(presentingIntent);
            }
        });

        liveCollabBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent shareIntent = new Intent(EditPres.this, Share.class);
                startActivity(shareIntent);
            }
        });

        presTitle.setText(presentation.getTitle());

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

    ActivityResultLauncher<Intent> sActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    if(result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        Uri uri = data.getData();
                    }
                }
            }

    );

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