package com.liverpool.playground.support;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.openqa.selenium.support.events.WebDriverListener;

/** Registra las excepciones que lanza WebDriver durante la prueba. */
public class ExceptionRecorder implements WebDriverListener {

    private final List<Throwable> errors = Collections.synchronizedList(new ArrayList<>());

    @Override
    public void onError(Object target, Method method, Object[] args, InvocationTargetException e) {
        errors.add(e.getTargetException());
    }

    public void reset() {
        errors.clear();
    }

    public List<Throwable> errors() {
        return new ArrayList<>(errors);
    }
}
