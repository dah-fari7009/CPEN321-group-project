package com.example.eloquent;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class AddPres extends AppCompatActivity {


    private EditText presTitle;
    private static final String TAG = "AddPres";
    private static final String BACKEND_HOST_AND_PORT = "http://20.104.77.70:8081";
    private static RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_pres);

        /* Toolbar */
        Button importButton;
        Toolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitleTextColor(getResources().getColor(R.color.white));
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle("New Presentation");
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        /* Edit the new presentation's title */
        presTitle = findViewById(R.id.presTitle);
        // it detects when the presentation title is edited, it will change the title on the app
        presTitle.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // nothing needs to be done here
            }
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(s.length() != 0) {
                    getSupportActionBar().setTitle(s);
                }
            }
            @Override
            public void afterTextChanged(Editable s) {
                // nothing needs to be done here
            }
        });

        /* Set up for sending HTTP requests */
        requestQueue = Volley.newRequestQueue(getApplicationContext());
    }

    // this will start a import activity and is invoked by pressing the import button
    ActivityResultLauncher<Intent> sActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                String importText;
                @Override
                public void onActivityResult(ActivityResult result) {
                    if(result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        Uri uri = data.getData();
                        byte[] bytes = getBytesFromUrl(getApplicationContext(), uri);
                        importText = new String((bytes));
                        Log.d(TAG, importText);
                        importPresentation(User.getInstance().getData().getUserID(), importText);
                    }
                }
            }
    );

    // return the menu with the add and save button
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.save_menu, menu);
        return true;
    }

    // when the save or delete button is clicked, it will create or delete the presentation

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if(item.getItemId() == R.id.delete) {
            Toast.makeText(this, "Delete button is clicked", Toast.LENGTH_SHORT).show();
        }
        if(item.getItemId() == R.id.save) {
            if(presTitle.getText().toString()!= null) {
                Presentation presentation = new Presentation(presTitle.getText().toString());

                // Create new presentation in backend
                createEmptyPresentation(User.getInstance().getData().getUserID(), presTitle.getText().toString());
            }
            else {
                Toast.makeText(getApplicationContext(),"Please enter a title", Toast.LENGTH_SHORT).show();
            }
        }
        return super.onOptionsItemSelected(item);
    }

    // open the choose file window and let user choose the data
    public void openFileDialog(View view) {
        Intent data = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        data.addCategory(Intent.CATEGORY_OPENABLE);
        data.setType("*/*");
        String[] mimeTypes = {"text/plain"};
        data.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        data = Intent.createChooser(data, "choose a file");
        sActivityResultLauncher.launch(data);
    }

    byte[] getBytesFromUrl (Context context, Uri uri) {
        InputStream inputStream = null;
        try {
            inputStream = context.getContentResolver().openInputStream(uri);
            ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];
            int len = 0;
            while((len = inputStream.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }
            return byteBuffer.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private void createEmptyPresentation(String userID, String title/*, Presentation presentation*/) {
        String url = BACKEND_HOST_AND_PORT + "/api/presentation"; // BACKEND_HOST_AND_PORT doesn't end with a "/"!
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                Intent savingIntent = new Intent(AddPres.this, MainActivity.class);
                startActivity(savingIntent);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        }) {
            @Override
            public Map<String, String> getParams() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("userID", userID);
                params.put("title", title);
                return params;
            }
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Content-Type", "application/x-www-form-urlencoded");
                return headers;
            }
        };

        requestQueue.add(stringRequest);
    }

    private void importPresentation(String userID, String presentationTextRep) {
        String url = BACKEND_HOST_AND_PORT + "/api/import"; // BACKEND_HOST_AND_PORT doesn't end with a "/"!
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                Intent savingIntent = new Intent(AddPres.this, MainActivity.class);
                startActivity(savingIntent);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        }) {
            @Override
            public Map<String, String> getParams() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("userID", userID);
                params.put("text", presentationTextRep);
                return params;
            }
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Content-Type", "application/x-www-form-urlencoded");
                return headers;
            }
        };

        requestQueue.add(stringRequest);
    }
}