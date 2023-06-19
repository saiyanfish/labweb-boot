package tw.com.ispan.eeit64.labwebboot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class  BaseController{
    @RequestMapping("")
    public String index(){
        return "index";
    }
    @RequestMapping("/client")
    public String client() {
        return "client";
    }
}