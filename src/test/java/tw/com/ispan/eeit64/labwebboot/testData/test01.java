package tw.com.ispan.eeit64.labwebboot.testData;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.entity.MessageBean;
import tw.com.ispan.eeit64.labwebboot.repository.RepositoryMember;
import tw.com.ispan.eeit64.labwebboot.repository.repositoryMsg;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@SpringBootTest
public class test01 {
    @Autowired
    private repositoryMsg msgg;
    @Autowired
    private RepositoryMember mem;
    @Test
    void xxx(){
//        List<MessageBean> aa=msgg.findAll();
//        List<MessageBean> aa=msgg.findAll(Sort.by("memberBean"));
        Page<MessageBean> aa=msgg.findAll(PageRequest.of(0,3));
        System.out.println( "pages:"+aa.getTotalPages());


        Optional<MessageBean>  bb =msgg.findById(4);

        if (bb.isPresent()){
        System.out.println("bb:"+bb.get().getMsg());}

        for (MessageBean a:aa){
            System.out.println(a.getMsg()+":"+a.getMemberBean().getId());
        }
        System.out.println(msgg.count());
        System.out.println(msgg.existsById(2));
    }
    @Test
    void insert(){
        MessageBean m1 =new MessageBean();
        MemberBean mem1 =mem.findById(2).get();
        m1.setMemberBean(mem1);
        m1.setMsg("SOUPb");
        msgg.save(m1);
    }
    @Test
    void insert2(){
        MemberBean m2 =new MemberBean();
        mem.save(m2);
    }
    @Test
    void update(){
        MessageBean m1 =new MessageBean();
        MemberBean mem1 =mem.findById(1).get();
        m1.setMessageid(5);

        m1.setMemberBean(mem1);
        m1.setMsg("優希");
        msgg.save(m1);
    }
    @Test
    void del(){
        msgg.deleteById(13);
    }
    @Test
    @Transactional
    void query1(){
      List<MemberBean> m1=  mem.method1(0);
        System.out.println(m1.get(1).getMessage().get(1).getMsg());
    }
    @Test
    void query2(){
       List<Object[]> list1= msgg.method1(1,"%SOUP%");
       for(Object [] s1:list1){
         MemberBean m = (MemberBean)s1[0];
           System.out.println(m.getId()+":"+s1[1]+":"+s1[2]);
       }
    }
}
