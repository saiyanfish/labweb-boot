package tw.com.ispan.eeit64.labwebboot.entity;

import javax.persistence.*;

@Entity
@Table(name = "Message")
public class MessageBean {
    @ManyToOne
    @JoinColumn(name = "memberid", referencedColumnName = "id")
    private MemberBean memberBean;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer messageid;
//    @Column(insertable = false, updatable = false)
//    private Integer memberid;
    private String msg;

    public MemberBean
    getMemberBean() {
        return memberBean;
    }

    public void setMemberBean(MemberBean memberBean) {
        this.memberBean = memberBean;
    }

    public Integer getMessageid() {
        return messageid;
    }

    public void setMessageid(Integer messageid) {
        this.messageid = messageid;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
