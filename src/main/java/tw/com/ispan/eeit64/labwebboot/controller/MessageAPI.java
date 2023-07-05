package tw.com.ispan.eeit64.labwebboot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.service.impl.MemberService;

import javax.websocket.server.PathParam;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MessageAPI {
    @Autowired
    private MemberService memberService;
    @GetMapping("")
    public ResponseEntity<List<MemberBean>> findall(){
   List<MemberBean> memberBeans=memberService.select(null);
   return ResponseEntity.ok(memberBeans);
    }
    @PostMapping
    public ResponseEntity<MemberBean> insert(@RequestBody MemberBean memberBean){
        MemberBean rs= memberService.insertWithoutId(memberBean);
        if(rs!=null){
            URI uri =URI.create("/api/"+rs.getId());
            return ResponseEntity.created(uri).body(memberBean);
        }else {
            return ResponseEntity.noContent().build();
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<MemberBean> selectMemberBean(@PathVariable("id") Integer id){
        MemberBean memberBean =new MemberBean();
        memberBean.setId(id);
        List<MemberBean> rs =memberService.select(memberBean);
        if(rs!=null && !rs.isEmpty()){
            return ResponseEntity.ok(rs.get(0));
        }else {
            return ResponseEntity.notFound().build();
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<MemberBean> update(@PathVariable("id") Integer id, @RequestBody MemberBean memberBean){
        memberBean.setId(id);
    MemberBean rs =memberService.update(memberBean);
    if(rs!=null){
        return ResponseEntity.ok(rs);
    }else {
        return ResponseEntity.notFound().build();
    }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<MemberBean> dele(@PathVariable("id") Integer id){
        MemberBean memberBean =new MemberBean();
        memberBean.setId(id);
       boolean rs= memberService.delete(memberBean);
       if(rs){
           return ResponseEntity.noContent().build();
       }else {
           return ResponseEntity.notFound().build();
       }

    }
}
