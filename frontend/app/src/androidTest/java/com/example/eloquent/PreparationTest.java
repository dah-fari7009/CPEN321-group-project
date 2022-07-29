package com.example.eloquent;

import static androidx.test.espresso.Espresso.*;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.typeText;
import static androidx.test.espresso.action.ViewActions.clearText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.*;

import android.content.Intent;
import android.graphics.Color;
import android.util.Log;

import androidx.test.espresso.Espresso;
import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.ViewInteraction;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import com.example.eloquent.Preparation;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;
import java.util.Arrays;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.assertion.ViewAssertions;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.filters.LargeTest;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.matcher.ViewMatchers.*;
import static org.hamcrest.Matchers.allOf;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class PreparationTest {

    Content content1 = new Content(Color.BLUE,"1TestFront");
    Content content2 = new Content(Color.BLUE,"1TestBack");
    Back back1 = new Back(Color.BLACK,content2);
    Front front1 = new Front(Color.WHITE,content1);
    Cards card1 = new Cards(front1,back1,Color.WHITE);

    Content content3 = new Content(Color.BLUE,"2TestFront");
    Content content4 = new Content(Color.BLUE,"2TestBack");
    Back back2 = new Back(Color.BLACK,content4);
    Front front2 = new Front(Color.WHITE,content3);
    Cards card2 = new Cards(front2,back2,Color.WHITE);

    Content content5 = new Content(Color.BLUE,"3TestFront");
    Content content6 = new Content(Color.BLUE,"3TestBack");
    Back back3 = new Back(Color.BLACK,content6);
    Front front3 = new Front(Color.WHITE,content5);
    Cards card3 = new Cards(front3,back3,Color.WHITE);
    private Presentation presentation = new Presentation(null,null,card1,card2,card3);

    @Rule
    public ActivityTestRule<Preparation> rule = new ActivityTestRule<Preparation>(Preparation.class,false,false);



    @Test
    public void testOpenPreparationPage (){
        testOpen();
        onView(withId(R.id.cueCard)).check(matches(withText("1TestFront")));

    }

    @Test
    public void testBackNextFlipSwapAddDeleteButton (){
        testOpen();
        ViewInteraction editText = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton = onView(
                allOf(withId(R.id.backButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                4),
                        isDisplayed()));
        appCompatImageButton.perform(click());

        ViewInteraction editText2 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText2.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton2 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton2.perform(click());

        ViewInteraction editText3 = onView(
                allOf(withId(R.id.cueCard), withText("1TestBack"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText3.check(matches(withText("1TestBack")));

        ViewInteraction appCompatImageButton3 = onView(
                allOf(withId(R.id.backButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                4),
                        isDisplayed()));
        appCompatImageButton3.perform(click());

        ViewInteraction editText4 = onView(
                allOf(withId(R.id.cueCard), withText("1TestBack"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText4.check(matches(withText("1TestBack")));

        ViewInteraction appCompatImageButton4 = onView(
                allOf(withId(R.id.swaplastButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                12),
                        isDisplayed()));
        appCompatImageButton4.perform(click());

        ViewInteraction editText5 = onView(
                allOf(withId(R.id.cueCard), withText("1TestBack"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText5.check(matches(withText("1TestBack")));

        ViewInteraction appCompatImageButton5 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton5.perform(click());

        ViewInteraction editText6 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText6.check(matches(withText("1TestFront")));

        onView(withId(R.id.cueCard)).perform(closeSoftKeyboard());

        ViewInteraction appCompatImageButton6 = onView(
                allOf(withId(R.id.swaplastButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                12),
                        isDisplayed()));
        appCompatImageButton6.perform(click());

        onView(withId(R.id.cueCard)).perform(closeSoftKeyboard());

        ViewInteraction editText7 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText7.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton7 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton7.perform(click());

        ViewInteraction editText8 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText8.check(matches(withText("2TestFront")));

        ViewInteraction appCompatImageButton8 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton8.perform(click());

        ViewInteraction appCompatImageButton9 = onView(
                allOf(withId(R.id.swaplastButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                12),
                        isDisplayed()));
        appCompatImageButton9.perform(click());

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        ViewInteraction editText9 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText9.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton10 = onView(
                allOf(withId(R.id.swaplastButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                12),
                        isDisplayed()));
        appCompatImageButton10.perform(click());

        ViewInteraction editText10 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText10.check(matches(withText("2TestFront")));

        ViewInteraction appCompatImageButton11 = onView(
                allOf(withId(R.id.backButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                4),
                        isDisplayed()));
        appCompatImageButton11.perform(click());

        ViewInteraction editText11 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText11.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton12 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton12.perform(click());

        ViewInteraction appCompatImageButton13 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton13.perform(click());

        ViewInteraction editText12 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText12.check(matches(withText("2TestFront")));

        ViewInteraction textView = onView(
                allOf(withId(R.id.pageNumber), withText("2/3"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        textView.check(matches(withText("2/3")));

        ViewInteraction appCompatImageButton14 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton14.perform(click());

        ViewInteraction appCompatImageButton15 = onView(
                allOf(withId(R.id.backButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                4),
                        isDisplayed()));
        appCompatImageButton15.perform(click());

        ViewInteraction editText13 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText13.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton16 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton16.perform(click());

        ViewInteraction appCompatImageButton17 = onView(
                allOf(withId(R.id.swapnextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                11),
                        isDisplayed()));
        appCompatImageButton17.perform(click());

        ViewInteraction editText14 = onView(
                allOf(withId(R.id.cueCard), withText("3TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText14.check(matches(withText("3TestFront")));

        ViewInteraction appCompatImageButton18 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton18.perform(click());

        ViewInteraction appCompatImageButton19 = onView(
                allOf(withId(R.id.swapnextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                11),
                        isDisplayed()));
        appCompatImageButton19.perform(click());

        ViewInteraction editText15 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText15.check(matches(withText("2TestFront")));

        ViewInteraction appCompatImageButton20 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton20.perform(click());

        ViewInteraction appCompatImageButton21 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton21.perform(click());

        ViewInteraction editText16 = onView(
                allOf(withId(R.id.cueCard), withText("3TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText16.check(matches(withText("3TestFront")));

        ViewInteraction appCompatImageButton22 = onView(
                allOf(withId(R.id.swapnextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                11),
                        isDisplayed()));
        appCompatImageButton22.perform(click());

        ViewInteraction editText17 = onView(
                allOf(withId(R.id.cueCard), withText("3TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText17.check(matches(withText("3TestFront")));

        ViewInteraction appCompatImageButton23 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton23.perform(click());

        ViewInteraction appCompatImageButton24 = onView(
                allOf(withId(R.id.nextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                5),
                        isDisplayed()));
        appCompatImageButton24.perform(click());

        ViewInteraction editText18 = onView(
                allOf(withId(R.id.cueCard), withText("3TestBack"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText18.check(matches(withText("3TestBack")));

        ViewInteraction appCompatImageButton25 = onView(
                allOf(withId(R.id.swapnextButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                11),
                        isDisplayed()));
        appCompatImageButton25.perform(click());

        ViewInteraction editText19 = onView(
                allOf(withId(R.id.cueCard), withText("3TestBack"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText19.check(matches(withText("3TestBack")));

        ViewInteraction appCompatImageButton26 = onView(
                allOf(withId(R.id.addButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                7),
                        isDisplayed()));
        appCompatImageButton26.perform(click());

        ViewInteraction editText20 = onView(
                allOf(withId(R.id.cueCard), withText(""),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText20.check(matches(withText("")));

        ViewInteraction appCompatImageButton27 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton27.perform(click());

        ViewInteraction appCompatImageButton28 = onView(
                allOf(withId(R.id.addButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                7),
                        isDisplayed()));
        appCompatImageButton28.perform(click());

        ViewInteraction editText21 = onView(
                allOf(withId(R.id.cueCard), withText(""),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText21.check(matches(withText("")));

        ViewInteraction appCompatImageButton29 = onView(
                allOf(withId(R.id.deleteButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                8),
                        isDisplayed()));
        appCompatImageButton29.perform(click());

        ViewInteraction editText22 = onView(
                allOf(withId(R.id.cueCard), withText(""),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText22.check(matches(withText("")));

        ViewInteraction appCompatImageButton30 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton30.perform(click());

        ViewInteraction appCompatImageButton31 = onView(
                allOf(withId(R.id.deleteButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                8),
                        isDisplayed()));
        appCompatImageButton31.perform(click());

        ViewInteraction editText23 = onView(
                allOf(withId(R.id.cueCard), withText("3TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText23.check(matches(withText("3TestFront")));

        ViewInteraction appCompatImageButton32 = onView(
                allOf(withId(R.id.deleteButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                8),
                        isDisplayed()));
        appCompatImageButton32.perform(click());

        ViewInteraction editText24 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText24.check(matches(withText("2TestFront")));

        ViewInteraction appCompatImageButton33 = onView(
                allOf(withId(R.id.backButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                4),
                        isDisplayed()));
        appCompatImageButton33.perform(click());

        ViewInteraction appCompatImageButton34 = onView(
                allOf(withId(R.id.deleteButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                8),
                        isDisplayed()));
        appCompatImageButton34.perform(click());

        ViewInteraction editText25 = onView(
                allOf(withId(R.id.cueCard), withText("2TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText25.check(matches(withText("2TestFront")));

        ViewInteraction appCompatImageButton35 = onView(
                allOf(withId(R.id.deleteButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                8),
                        isDisplayed()));
        appCompatImageButton35.perform(click());

        ViewInteraction editText26 = onView(
                allOf(withId(R.id.cueCard), withText(""),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText26.check(matches(withText("")));
    }

    @Test
    public void testUndoRedoButton() {
        testOpen();
        ViewInteraction appCompatEditText = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                1),
                        isDisplayed()));
        appCompatEditText.perform(replaceText("testCueCards"));

        ViewInteraction appCompatEditText2 = onView(
                allOf(withId(R.id.cueCard), withText("testCueCards"),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                1),
                        isDisplayed()));
        appCompatEditText2.perform(closeSoftKeyboard());

        ViewInteraction editText = onView(
                allOf(withId(R.id.cueCard), withText("testCueCards"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText.check(matches(withText("testCueCards")));

        ViewInteraction appCompatImageButton = onView(
                allOf(withId(R.id.undoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                10),
                        isDisplayed()));
        appCompatImageButton.perform(click());


        ViewInteraction editText2 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText2.check(matches(withText("1TestFront")));


        ViewInteraction appCompatImageButton2 = onView(
                allOf(withId(R.id.undoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                10),
                        isDisplayed()));
        appCompatImageButton2.perform(click());

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        ViewInteraction editText3 = onView(
                allOf(withId(R.id.cueCard), withText(""),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText3.check(matches(withText("")));

        ViewInteraction appCompatImageButton3 = onView(
                allOf(withId(R.id.redoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                9),
                        isDisplayed()));
        appCompatImageButton3.perform(click());

        ViewInteraction editText4 = onView(
                allOf(withId(R.id.cueCard), withText("1TestFront"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText4.check(matches(withText("1TestFront")));

        ViewInteraction appCompatImageButton4 = onView(
                allOf(withId(R.id.redoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                9),
                        isDisplayed()));
        appCompatImageButton4.perform(click());

        ViewInteraction editText5 = onView(
                allOf(withId(R.id.cueCard), withText("testCueCards"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText5.check(matches(withText("testCueCards")));

        ViewInteraction appCompatImageButton5 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton5.perform(click());

        ViewInteraction appCompatImageButton6 = onView(
                allOf(withId(R.id.flipButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                6),
                        isDisplayed()));
        appCompatImageButton6.perform(click());

        ViewInteraction appCompatImageButton7 = onView(
                allOf(withId(R.id.undoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                10),
                        isDisplayed()));
        appCompatImageButton7.perform(click());

        ViewInteraction editText6 = onView(
                allOf(withId(R.id.cueCard), withText("testCueCards"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText6.check(matches(withText("testCueCards")));

        ViewInteraction appCompatImageButton8 = onView(
                allOf(withId(R.id.redoButton),
                        childAtPosition(
                                allOf(withId(R.id.cueCard_background),
                                        childAtPosition(
                                                withId(android.R.id.content),
                                                0)),
                                9),
                        isDisplayed()));
        appCompatImageButton8.perform(click());

        ViewInteraction editText7 = onView(
                allOf(withId(R.id.cueCard), withText("testCueCards"),
                        withParent(allOf(withId(R.id.cueCard_background),
                                withParent(withId(android.R.id.content)))),
                        isDisplayed()));
        editText7.check(matches(withText("testCueCards")));
    }



    public void testOpen() {
        Intent i = new Intent();
        i.putExtra("specificArgument", presentation);
        rule.launchActivity(i);
    }

    private static org.hamcrest.Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }

}
