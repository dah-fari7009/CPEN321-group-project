package com.example.eloquent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.text.Editable;
import android.text.InputType;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.api.client.extensions.android.http.AndroidHttp;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class EditPres extends AppCompatActivity {


    private EditText presTitle;
    private TextView sharedWithCountDisplay;
    private int sharedWithCount;
    private static final String TAG = "EditPres";
    private String BACKEND_HOST_AND_PORT;
    private static RequestQueue requestQueue;
    String userID;

    Presentation presentation;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_pres);
        BACKEND_HOST_AND_PORT = getString(R.string.backend_host);

        Button preparationBtn;
        Button presentingBtn;
        Button liveCollabBtn;
        Button exportButton;
        Button shareButton;
        Toolbar toolbar;



        presentation = (Presentation) getIntent().getSerializableExtra("Presentation");
        userID = getIntent().getExtras().getString("userID");

        Log.d(TAG, "title of opened presentation is '" + presentation.getTitle() + "'");

        /* Set up toolbar */
        toolbar = findViewById(R.id.toolbar);
        toolbar.setTitleTextColor(getResources().getColor(R.color.white));
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(presentation.getTitle());
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        /* Set up for sending HTTP requests */
        requestQueue = Volley.newRequestQueue(getApplicationContext());

        /* Set up presentation title box, navigation buttons, and other dynamic UI elements */
        presTitle = findViewById(R.id.presTitle);
        preparationBtn = findViewById(R.id.preparationButton);
        presentingBtn = findViewById(R.id.presentingButton);
        liveCollabBtn = findViewById(R.id.liveCollabButton);
        exportButton = findViewById(R.id.exportButton);
        shareButton = findViewById(R.id.shareButton);
        sharedWithCountDisplay = findViewById(R.id.sharedWithCount);

        sharedWithCount = presentation.users.size();
        updateSharedWithCountMessage(sharedWithCount);

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
                checkPermissionAndStartPresentingActivity();
            }
        });

        shareButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlertDialog.Builder builder = new AlertDialog.Builder(EditPres.this);
                builder.setTitle("Enter the email you want to share your presentation to");

                // Set up the input
                final EditText input = new EditText(EditPres.this);
                // Specify the type of input expected; this, for example, sets the input as a password, and will mask the text
                input.setInputType(InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
                builder.setView(input);

                // Set up the buttons
                builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        String m_Text = input.getText().toString();
                        Log.d(TAG, "shareButton: onClick: sharing presentation '" + presentation.getTitle() + "' with user '" + m_Text + "'");
                        sharePresentation(m_Text, presentation.presentationID);
                    }
                });
                builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.cancel();
                    }
                });

                builder.show();
            }
        });

        liveCollabBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent shareIntent = new Intent(EditPres.this, LiveCollaboration.class);
                startActivity(shareIntent);
            }
        });

        exportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                exportPresentation();
            }
        });

        /* Display and edit presentation title */
        presTitle.setText(presentation.getTitle());
        presTitle.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // nothing to be done here
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(s.length() != 0) {
                    getSupportActionBar().setTitle(s);
                    presentation.setIsTitleChanged(true);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                //nothing to be done here
            }
        });
    }

    private void updateSharedWithCountMessage(int count) {
        String[] numUsersWithAccessMessageWords = String.valueOf(sharedWithCountDisplay.getText()).split(" ");
        String numUsersWithAccessMessage = "";
        numUsersWithAccessMessageWords[numUsersWithAccessMessageWords.length - 1] = String.valueOf(count);
        for (int i = 0; i < numUsersWithAccessMessageWords.length; i++) {
            numUsersWithAccessMessage += numUsersWithAccessMessageWords[i];
            numUsersWithAccessMessage += " ";
        }
        sharedWithCountDisplay.setText(numUsersWithAccessMessage);
    }


//    private void requestSignIn() {
//        GoogleSignInOptions signInOptions = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
//                .requestEmail()
//                .requestScopes(new Scope(DriveScopes.DRIVE_FILE))
//                .build();
//
//        GoogleSignInClient client = GoogleSignIn.getClient(this, signInOptions);
//
//        startActivityForResult(client.getSignInIntent(),400);
//
//    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch(requestCode)
        {
            case 400:
                if(resultCode == RESULT_OK) {
                    handleSignInIntent(data);
                }
                break;
            default: // nothing to be done here
        }
    }

    private void handleSignInIntent(Intent data) {
        GoogleSignIn.getSignedInAccountFromIntent(data)
                .addOnSuccessListener(new OnSuccessListener<GoogleSignInAccount>() {
                    DriverServiceHelper driverServiceHelper;
                    @Override
                    public void onSuccess(GoogleSignInAccount googleSignInAccount) {
                        GoogleAccountCredential credential = GoogleAccountCredential.
                                usingOAuth2(EditPres.this, Collections.singleton(DriveScopes.DRIVE_FILE));

                        Drive googleDriveService = new Drive.Builder(
                                AndroidHttp.newCompatibleTransport(),
                                new GsonFactory(),
                                credential)
                                .setApplicationName("Drive")
                                .build();

                        driverServiceHelper = new DriverServiceHelper(googleDriveService);
//                        driverServiceHelper.createFile("/storage/emulated/0/Downloads/sampleInputText.txt");
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.d(TAG, "handleSignInIntent: Failed to get signed-in Google account from intent.");
                    }
                });
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
            Log.d(TAG, "onOptionsItemSelected: delete button pressed.");
            deletePresentation(User.getInstance().getData().getUserID(), presentation.presentationID);
        }
        if(item.getItemId() == R.id.save) {
            if(presentation.title != null && presentation.getIsTitleChanged() == true) {
                presentation.title = presTitle.getText().toString();
                saveTitleAndGoToMainActivity(User.getInstance().getData().getUserID(), presentation.presentationID);
            }
            else {
                Toast.makeText(getApplicationContext(),"Title cannot be null", Toast.LENGTH_SHORT).show();
            }
        }
        return super.onOptionsItemSelected(item);
    }

    private void checkPermissionAndStartPresentingActivity() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            Intent presentingIntent = new Intent(EditPres.this, Presenting.class);
            presentingIntent.putExtra("Presentation", presentation);
            startActivity(presentingIntent);
        } else {
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.RECORD_AUDIO)) {
                Toast.makeText(this, "We need these location permissions to run!", Toast.LENGTH_LONG).show();
                new AlertDialog.Builder(this)
                        .setTitle("Need Recording Permissions")
                        .setMessage("We need your audio recording permissions to mark automatically switch cue cards")
                        .setNegativeButton("CANCEL", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                Toast.makeText(EditPres.this, "We need these location permissions to run!", Toast.LENGTH_LONG).show();
                                dialog.dismiss();
                            }
                        })
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                ActivityCompat.requestPermissions(EditPres.this, new String[] {Manifest.permission.RECORD_AUDIO}, 1);
                            }
                        })
                        .create()
                        .show();
            } else {
                ActivityCompat.requestPermissions(this, new String[] {Manifest.permission.RECORD_AUDIO}, 1);
            }
        }
    }



    private void deletePresentation(String userID, String presID) {
        String url = BACKEND_HOST_AND_PORT + "/api/presentation?userID=" + userID + "&presID=" + presID;
        StringRequest stringRequest = new StringRequest(Request.Method.DELETE, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                Intent changingIntent = new Intent(EditPres.this, MainActivity.class);
                startActivity(changingIntent);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG, error.toString());
            }
        });

        requestQueue.add(stringRequest);
    }

    private void exportPresentation() {
        String url = BACKEND_HOST_AND_PORT + "/api/export"; // BACKEND_HOST_AND_PORT doesn't end with a "/"!

        ObjectMapper objectMapper = new ObjectMapper();
        String presJsonString;
        JSONObject pres;

        try {
            presJsonString = objectMapper.writeValueAsString(presentation);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            presJsonString = null;
            pres = null;
            throw new NullPointerException();
        }
        try {
            pres = new JSONObject(presJsonString);
        } catch (JSONException e) {
            e.printStackTrace();
            presJsonString = null;
            pres = null;
            throw new NullPointerException();
        }

        JSONObject body = new JSONObject();
        try {
            body.put("pres", pres);
            body.put("userID", userID);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, body,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d(TAG, response.toString());
//                        requestSignIn();
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString());
                    }
                }
        );

        requestQueue.add(jsonObjectRequest);
    }

    private void saveTitleAndGoToMainActivity(String userID, String presID) {
        String url = BACKEND_HOST_AND_PORT + "/api/savePresentation"; // BACKEND_HOST_AND_PORT doesn't end with a "/"!
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

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.PUT, url, body, new Response.Listener<JSONObject>() {
            @Override
                public void onResponse(JSONObject response) {
                Log.d(TAG, response.toString());
                presentation.setIsTitleChanged(false);
                Intent changingIntent = new Intent(EditPres.this, MainActivity.class);
                startActivity(changingIntent);
                }
            }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        });

        requestQueue.add(jsonObjectRequest);
    }

    private void sharePresentation(String targetUser, String presentationID) {
        //ObjectMapper objectMapper = new ObjectMapper();
        String url = BACKEND_HOST_AND_PORT + "/api/share";
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                updateSharedWithCountMessage(++sharedWithCount);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        }) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("username", targetUser);
                params.put("presID", presentationID);
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