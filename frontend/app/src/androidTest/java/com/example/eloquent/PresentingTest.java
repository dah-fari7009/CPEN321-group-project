package com.example.eloquent;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.swipeLeft;
import static androidx.test.espresso.action.ViewActions.swipeRight;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;

import android.os.SystemClock;

import androidx.test.espresso.intent.rule.IntentsTestRule;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.rule.ActivityTestRule;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class PresentingTest {

    int numberOfCueCard = 3;

    @Rule
    public ActivityTestRule<Presenting> activityTestRule = new ActivityTestRule<Presenting>(Presenting.class);

    @Test
    public void checkContent() {
        onView(withId(R.id.linear_lay)).check(matches(withText("1Front")));
    }

    @Test
    public void TestSwipeRight() {

        onView(withId(R.id.linear_lay)).perform(swipeRight());
        onView(withId(R.id.linear_lay)).check(matches(withText("1Front")));
    }

    @Test
    public void TestSwipeLeft() {
        onView(withId(R.id.linear_lay)).perform(swipeLeft());
        onView(withId(R.id.linear_lay)).check(matches(withText("2Front")));
    }

    @Test
    public void TestSwipeDown() {
        onView(withId(R.id.linear_lay)).perform(swipeLeft());
        onView(withId(R.id.linear_lay)).check(matches(withText("2Back")));
    }

    @Test
    public void TestSwipeUp() {
        onView(withId(R.id.linear_lay)).perform(swipeLeft());
        onView(withId(R.id.linear_lay)).check(matches(withText("2Front")));
    }

    @Test
    public void TestSpeechToText() {
        onView(withId(R.id.linear_lay)).perform(swipeLeft());
        onView(withId(R.id.linear_lay)).check(matches(withText("2Front")));
    }
}
