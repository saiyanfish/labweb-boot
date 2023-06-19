package tw.com.ispan.eeit64.labwebboot.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "member")

public class MemberBean {
    @OneToMany(mappedBy = "memberBean",cascade = CascadeType.ALL)
   private List<MessageBean> message;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String bio;

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
    public List<MessageBean> getMessage() {
        return message;
    }

    public void setMessage(List<MessageBean> message) {
        this.message = message;
    }

}
